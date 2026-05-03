import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './App.css';

const SUCCESS_REFRESH_MS = 60000;
const ERROR_REFRESH_MS = 180000;
const DEFAULT_REMOTE_API_BASE = 'https://api-controle-ecru.vercel.app';

const ENDPOINTS = [
  'obterTodosDados', 'getEstatisticas', 'obterMotoristas', 'salvarMotorista',
  'deletarMotorista', 'salvarRascunho', 'obterRascunho', 'limparRascunho',
  'liberarRoteiro', 'obterRoteiroAtivo', 'expirarRoteiro', 'obterAcessos',
  'salvarAcesso', 'verificarAcesso', 'obterSenhaDoDia', 'validarLoginMotorista',
  'registrarLogAcesso', 'obterLogsAcesso', 'buscarMultiplasNFs', 'importarNotas',
  'processar035', 'salvarProdutosConferente', 'obterProdutosConferente',
  'buscarProdutosPorNF', 'setupCompleto', 'limparDuplicatas', 'limparAba',
  'recriarAba', 'listarAbas'
];

function getApiBases() {
  const envBase = process.env.REACT_APP_API_BASE_URL?.trim();
  const bases = [envBase || DEFAULT_REMOTE_API_BASE];

  if (typeof window !== 'undefined') {
    const { origin, hostname, port } = window.location;

    // Em producao (rododex-roteiro.vercel.app), tenta tambem a origem atual.
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      bases.push(origin);
    }

    // Fallback comum: frontend no 3000 e API (vercel dev) no 3001
    if (hostname === 'localhost' && port === '3000') {
      bases.push('http://localhost:3001');
    }
  }

  return [...new Set(bases)];
}

async function postAction(action, signal) {
  const bases = getApiBases();
  const errors = [];

  for (const base of bases) {
    const url = `${base.replace(/\/$/, '')}/api/notas`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
        signal
      });

      if (!response.ok) {
        const text = await response.text().catch(() => 'sem detalhes');
        throw new Error(`HTTP ${response.status} em ${url} (${text.slice(0, 80)})`);
      }

      const data = await response.json();
      if (!data?.success) {
        throw new Error(data?.message || `Action ${action} retornou falha em ${url}`);
      }

      return data.data;
    } catch (error) {
      errors.push(error?.message || `Falha em ${url}`);
    }
  }

  throw new Error(errors.join(' | '));
}

function App() {
  const [stats, setStats] = useState(null);
  const [acessos, setAcessos] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [atualizando, setAtualizando] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [proximaTentativaEm, setProximaTentativaEm] = useState(SUCCESS_REFRESH_MS / 1000);

  const timerRef = useRef(null);
  const tickerRef = useRef(null);

  const totalAcessosAtivos = useMemo(() => {
    if (!acessos) return 0;
    return Object.values(acessos).filter((item) => item.status === 'ativo' && item.tipo !== 'bloqueado').length;
  }, [acessos]);

  const carregarDados = useCallback(async ({ manual = false } = {}) => {
    const controller = new AbortController();
    setAtualizando(true);
    setErro('');

    try {
      const [statsResult, acessosResult] = await Promise.allSettled([
        postAction('getEstatisticas', controller.signal),
        postAction('obterAcessos', controller.signal)
      ]);

      const falhas = [];

      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value || null);
      } else {
        falhas.push(`Estatisticas: ${statsResult.reason?.message || 'erro desconhecido'}`);
      }

      if (acessosResult.status === 'fulfilled') {
        setAcessos(acessosResult.value || null);
      } else {
        falhas.push(`Acessos: ${acessosResult.reason?.message || 'erro desconhecido'}`);
      }

      if (falhas.length > 0) {
        throw new Error(falhas.join(' | '));
      }

      setUltimaAtualizacao(new Date());
      setProximaTentativaEm(SUCCESS_REFRESH_MS / 1000);
      return SUCCESS_REFRESH_MS;
    } catch (error) {
      const message = error?.message || 'Falha ao carregar dados da API';
      setErro(message);

      // Evita spam no console quando endpoint local nao existe
      setProximaTentativaEm(ERROR_REFRESH_MS / 1000);
      return ERROR_REFRESH_MS;
    } finally {
      setCarregando(false);
      setAtualizando(false);
      if (!manual) controller.abort();
    }
  }, []);

  const agendarProximoCarregamento = useCallback((ms) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const nextMs = await carregarDados();
      agendarProximoCarregamento(nextMs);
    }, ms);
  }, [carregarDados]);

  useEffect(() => {
    let ativo = true;

    (async () => {
      const ms = await carregarDados();
      if (ativo) agendarProximoCarregamento(ms);
    })();

    tickerRef.current = setInterval(() => {
      setProximaTentativaEm((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      ativo = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (tickerRef.current) clearInterval(tickerRef.current);
    };
  }, [agendarProximoCarregamento, carregarDados]);

  const onAtualizarAgora = async () => {
    const nextMs = await carregarDados({ manual: true });
    agendarProximoCarregamento(nextMs);
  };

  if (carregando) {
    return (
      <div className="dashboard-shell">
        <div className="loading-card">
          <h1>Rododex API Control</h1>
          <p>Inicializando painel e conectando com Google Sheets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      <main className="dashboard-wrap">
        <header className="hero">
          <div>
            <p className="eyebrow">Painel Operacional</p>
            <h1>Rododex API Control</h1>
            <p className="subhead">Gateway de alta confiabilidade para Google Sheets com proteção CORS e monitoramento contínuo.</p>
          </div>
          <div className={`status-pill ${erro ? 'is-warning' : 'is-ok'}`}>
            {erro ? 'Operando com alerta' : 'Operando normal'}
          </div>
        </header>

        <section className="metrics-grid">
          <article className="metric-card">
            <p className="metric-label">Notas Fiscais</p>
            <p className="metric-value">{stats ? (stats.totalNotas || 0).toLocaleString('pt-BR') : '-'}</p>
          </article>
          <article className="metric-card">
            <p className="metric-label">Motoristas</p>
            <p className="metric-value">{stats ? (stats.totalMotoristas || 0) : '-'}</p>
          </article>
          <article className="metric-card">
            <p className="metric-label">Com Endereco</p>
            <p className="metric-value">{stats ? (stats.comEndereco || 0).toLocaleString('pt-BR') : '-'}</p>
          </article>
          <article className="metric-card">
            <p className="metric-label">Acessos Ativos</p>
            <p className="metric-value">{totalAcessosAtivos}</p>
          </article>
        </section>

        <section className="panel-grid">
          <article className="panel">
            <h2>Saude do Sistema</h2>
            <div className="row"><span>Endpoint</span><strong>{`${getApiBases()[0]}/api/notas`}</strong></div>
            <div className="row"><span>Cache</span><strong>{stats && stats.totalNotas > 0 ? 'Carregado' : 'Vazio'}</strong></div>
            <div className="row"><span>Ultima atualizacao</span><strong>{ultimaAtualizacao ? ultimaAtualizacao.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : 'Nao disponivel'}</strong></div>
            <div className="row"><span>Proxima tentativa</span><strong>{proximaTentativaEm}s</strong></div>
            {erro && <p className="error-box">{erro}</p>}
            <button type="button" onClick={onAtualizarAgora} className="refresh-button" disabled={atualizando}>
              {atualizando ? 'Atualizando...' : 'Atualizar agora'}
            </button>
          </article>

          <article className="panel">
            <h2>Actions Suportadas</h2>
            <div className="actions-list">
              {ENDPOINTS.map((action) => (
                <span key={action} className="action-chip">{action}</span>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

export default App;
