// src/App.js
// PAINEL DE STATUS REACT - RAIZ DO DOMÍNIO

import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [stats, setStats] = useState(null);
  const [acessos, setAcessos] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    carregarDados();
    
    // Atualizar a cada 60 segundos
    const interval = setInterval(carregarDados, 60000);
    return () => clearInterval(interval);
  }, []);

  const carregarDados = async () => {
    try {
      // Buscar estatísticas
      const respStats = await fetch('/api/notas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getEstatisticas' })
      });
      const dataStats = await respStats.json();
      if (dataStats.success) {
        setStats(dataStats.data);
      }

      // Buscar acessos
      const respAcessos = await fetch('/api/notas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'obterAcessos' })
      });
      const dataAcessos = await respAcessos.json();
      if (dataAcessos.success) {
        setAcessos(dataAcessos.data);
      }
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const totalAcessosAtivos = acessos 
    ? Object.values(acessos).filter(a => a.status === 'ativo' && a.tipo !== 'bloqueado').length 
    : 0;

  if (carregando) {
    return (
      <div className="app-root">
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Conectando à API...</p>
          <p className="loading-sub">Verificando status do sistema</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-root">
      <div className="container">
        
        {/* CABEÇALHO */}
        <header className="header">
          <h1 className="header-title">
            🚀 Rododex API
          </h1>
          <p className="header-subtitle">Sistema de Espelho de Carga Digital</p>
          
          <div className="status-badge">
            <span className="status-dot"></span>
            <span>Sistema Online • v22.2</span>
          </div>
        </header>
        
        {/* ESTATÍSTICAS */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-value">
              {stats ? (stats.totalNotas || 0).toLocaleString('pt-BR') : '—'}
            </div>
            <div className="stat-label">Notas Fiscais</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">
              {stats ? (stats.totalMotoristas || 0) : '—'}
            </div>
            <div className="stat-label">Motoristas</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📍</div>
            <div className="stat-value">
              {stats ? (stats.comEndereco || 0).toLocaleString('pt-BR') : '—'}
            </div>
            <div className="stat-label">Com Endereço</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-value">
              {stats ? (stats.totalVolumes || 0).toLocaleString('pt-BR') : '—'}
            </div>
            <div className="stat-label">Total Volumes</div>
          </div>
        </div>
        
        {/* INFORMAÇÕES */}
        <div className="section">
          <h2 className="section-title">
            <span className="section-icon">⚙️</span>
            Informações do Sistema
          </h2>
          
          <div className="info-row">
            <span className="info-label">Endpoint Principal</span>
            <span className="info-value"><code>POST /api/notas</code></span>
          </div>
          
          <div className="info-row">
            <span className="info-label">Método</span>
            <span className="info-value">POST com <code>{'{"action": "..."}'}</code> no body</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">Acessos Ativos</span>
            <span className="info-value">{totalAcessosAtivos} motorista(s)</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">Versão</span>
            <span className="info-value">22.2 Premium</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">Cache 038</span>
            <span className="info-value">
              {stats && stats.totalNotas > 0 ? '✅ Carregado' : '⚠️ Vazio'}
            </span>
          </div>
          
          {erro && (
            <div className="info-row">
              <span className="info-label">Aviso</span>
              <span className="info-value erro">{erro}</span>
            </div>
          )}
        </div>
        
        {/* ENDPOINTS */}
        <div className="section">
          <h2 className="section-title">
            <span className="section-icon">🔌</span>
            Actions Disponíveis
          </h2>
          <div className="endpoint-grid">
            {[
              'obterTodosDados', 'getEstatisticas', 'obterMotoristas',
              'salvarMotorista', 'deletarMotorista', 'salvarRascunho',
              'obterRascunho', 'limparRascunho', 'liberarRoteiro',
              'obterRoteiroAtivo', 'expirarRoteiro', 'obterAcessos',
              'salvarAcesso', 'verificarAcesso', 'obterSenhaDoDia',
              'validarLoginMotorista', 'registrarLogAcesso', 'obterLogsAcesso',
              'buscarMultiplasNFs', 'importarNotas', 'processar035',
              'salvarProdutosConferente', 'obterProdutosConferente',
              'buscarProdutosPorNF', 'setupCompleto', 'limparDuplicatas',
              'limparAba', 'recriarAba', 'listarAbas'
            ].map(endpoint => (
              <span key={endpoint} className="endpoint-tag">{endpoint}</span>
            ))}
          </div>
        </div>
        
        {/* EXEMPLO */}
        <div className="section">
          <h2 className="section-title">
            <span className="section-icon">📝</span>
            Exemplo de Chamada
          </h2>
          <div className="info-row">
            <span className="info-label">URL</span>
            <span className="info-value"><code>POST /api/notas</code></span>
          </div>
          <div className="info-row">
            <span className="info-label">Headers</span>
            <span className="info-value"><code>Content-Type: application/json</code></span>
          </div>
          <div className="info-row">
            <span className="info-label">Body (exemplo)</span>
            <span className="info-value"><code>{'{"action": "getEstatisticas"}'}</code></span>
          </div>
        </div>
        
        {/* RODAPÉ */}
        <footer className="footer">
          <p>Rododex Transportes • Espelho de Carga Digital</p>
          <p className="timestamp">
            🕐 {new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
          </p>
          <p className="footer-link">
            <a href="/api/notas" target="_blank" rel="noopener noreferrer">
              /api/notas
            </a>
          </p>
          <button onClick={carregarDados} className="refresh-btn">
            🔄 Atualizar
          </button>
        </footer>
        
      </div>
    </div>
  );
}

export default App;
