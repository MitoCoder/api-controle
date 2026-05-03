import { applyCors, isPreflight } from './_lib/http.js';
import { callAppsScript, getCached, setCached } from './_lib/sheetsClient.js';

const CACHE_TTL_MS = 10000;

async function getActionData(action) {
  const payload = { action };
  const cached = getCached(payload);
  if (cached) return cached;

  const response = await callAppsScript(payload, { timeoutMs: 15000 });
  setCached(payload, response, CACHE_TTL_MS);
  return response;
}

export default async function handler(req, res) {
  applyCors(req, res);

  if (isPreflight(req)) {
    return res.status(204).end();
  }

  let stats = null;
  let acessos = null;
  let erroStats = null;

  try {
    const [statsResult, acessosResult] = await Promise.allSettled([
      getActionData('getEstatisticas'),
      getActionData('obterAcessos')
    ]);

    if (statsResult.status === 'fulfilled' && statsResult.value?.success) {
      stats = statsResult.value.data;
    } else {
      erroStats = statsResult.reason?.message || 'Falha ao carregar estatisticas';
    }

    if (acessosResult.status === 'fulfilled' && acessosResult.value?.success) {
      acessos = acessosResult.value.data;
    }
  } catch (err) {
    erroStats = err?.message || 'Erro ao montar painel';
  }

  const totalAcessosAtivos = acessos
    ? Object.values(acessos).filter((a) => a.status === 'ativo' && a.tipo !== 'bloqueado').length
    : 0;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  return res.status(200).send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rododex API - Painel</title>
</head>
<body style="font-family:Segoe UI,Roboto,Arial,sans-serif;background:#0f172a;color:#e2e8f0;padding:24px;">
  <main style="max-width:900px;margin:0 auto;">
    <h1 style="margin:0 0 8px;">Rododex API</h1>
    <p style="margin:0 0 18px;color:#94a3b8;">Sistema online e protegido contra CORS no endpoint de proxy.</p>

    <section style="background:#111827;border:1px solid #1f2937;border-radius:12px;padding:16px;margin-bottom:12px;">
      <h2 style="margin:0 0 8px;font-size:18px;">Resumo</h2>
      <p>Total de notas: <strong>${stats ? (stats.totalNotas || 0).toLocaleString('pt-BR') : '-'}</strong></p>
      <p>Acessos ativos: <strong>${totalAcessosAtivos}</strong></p>
      <p>Cache 038: <strong>${stats && stats.totalNotas > 0 ? 'Carregado' : 'Vazio'}</strong></p>
      ${erroStats ? `<p style="color:#fca5a5;">Aviso: ${erroStats}</p>` : ''}
    </section>

    <section style="background:#111827;border:1px solid #1f2937;border-radius:12px;padding:16px;">
      <h2 style="margin:0 0 8px;font-size:18px;">Uso</h2>
      <p>Endpoint: <code>POST /api/notas</code></p>
      <p>Exemplo de body: <code>{ "action": "getEstatisticas" }</code></p>
      <p style="color:#94a3b8;">Atualizado em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
    </section>
  </main>
</body>
</html>`);
}
