import { applyCors, isPreflight, jsonError } from './_lib/http.js';
import { callAppsScript, getCached, setCached } from './_lib/sheetsClient.js';
import { isAllowedAction, normalizeAction, shouldCacheAction } from './_lib/actions.js';

const TAMANHO_LOTE = 200;
const DELAY_ENTRE_LOTES = 200;
const CACHE_TTL_MS = 10000;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
}

export default async function handler(req, res) {
  applyCors(req, res);

  if (isPreflight(req)) {
    return res.status(204).end();
  }

  if (!['GET', 'POST'].includes(req.method)) {
    return jsonError(res, 405, `Metodo ${req.method} nao permitido`);
  }

  const body = parseBody(req);
  const action = normalizeAction(req.query.action || body.action);

  if (!action) {
    return jsonError(res, 400, 'Action nao fornecida');
  }

  if (!isAllowedAction(action)) {
    return jsonError(res, 400, `Action invalida: ${action}`);
  }

  try {
    const dados = body.dados;

    if (action === 'importar') {
      if (!Array.isArray(dados) || dados.length === 0) {
        return jsonError(res, 400, 'Para importar, envie um array em dados');
      }

      const total = dados.length;
      let enviados = 0;
      let sucesso = 0;

      for (let i = 0; i < total; i += TAMANHO_LOTE) {
        const lote = dados.slice(i, i + TAMANHO_LOTE);
        const resposta = await callAppsScript({ action, dados: lote });

        if (!resposta?.success) {
          throw new Error(resposta?.message || 'Erro ao importar lote');
        }

        enviados += lote.length;
        sucesso += Number(resposta?.novas || lote.length);

        if (enviados < total) {
          await delay(DELAY_ENTRE_LOTES);
        }
      }

      return res.status(200).json({
        success: true,
        novas: sucesso,
        total
      });
    }

    const payload = { ...body, action };

    if (shouldCacheAction(action)) {
      const cached = getCached(payload);
      if (cached) {
        return res.status(200).json(cached);
      }
    }

    const data = await callAppsScript(payload);

    if (shouldCacheAction(action)) {
      setCached(payload, data, CACHE_TTL_MS);
    }

    return res.status(200).json(data);
  } catch (error) {
    const isTimeout = error?.name === 'AbortError';
    const message = isTimeout
      ? 'Timeout ao consultar Google Sheets. Tente novamente.'
      : `Erro interno: ${error.message}`;

    return jsonError(res, isTimeout ? 504 : 500, message);
  }
}
