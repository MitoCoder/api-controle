// /api/index.js
// PAINEL DE STATUS - RAIZ DO DOMÍNIO

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxS8sqLREMnoymQ_1Dy5AZ_BQn7iN_2lx42Z9yKswcRSNCzppEn-ILXlB0CjdUav93PlA/exec';

export default async function handler(req, res) {
  
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Buscar estatísticas da API
  let stats = null;
  let acessos = null;
  let erroStats = null;

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getEstatisticas' })
    });
    const data = await response.json();
    if (data.success) {
      stats = data.data;
    }
  } catch (err) {
    erroStats = err.message;
  }

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'obterAcessos' })
    });
    const data = await response.json();
    if (data.success) {
      acessos = data.data;
    }
  } catch (err) {
    // ignora
  }

  const totalAcessosAtivos = acessos 
    ? Object.values(acessos).filter(a => a.status === 'ativo' && a.tipo !== 'bloqueado').length 
    : 0;

  // Retornar HTML bonito
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  
  return res.status(200).send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🚀 Rododex API - Painel</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
      background: linear-gradient(135deg, #0a0f1e 0%, #1a1f3e 50%, #0d1b2a 100%);
      min-height: 100vh;
      color: #e0e0e0;
      padding: 20px;
    }
    
    .container {
      max-width: 1000px;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      padding: 40px 20px 30px;
      position: relative;
    }
    
    .header h1 {
      font-size: 2.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 10px;
      letter-spacing: -0.5px;
    }
    
    .header .subtitle {
      color: #8892b0;
      font-size: 1rem;
      font-weight: 400;
    }
    
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(76, 175, 80, 0.15);
      border: 1px solid rgba(76, 175, 80, 0.3);
      padding: 10px 24px;
      border-radius: 50px;
      margin: 15px 0;
      font-weight: 600;
      font-size: 0.95rem;
    }
    
    .status-dot {
      width: 12px;
      height: 12px;
      background: #4caf50;
      border-radius: 50%;
      box-shadow: 0 0 16px #4caf50, 0 0 32px rgba(76, 175, 80, 0.4);
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(1.1); }
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    
    .stat-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 25px 20px;
      text-align: center;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #667eea, #764ba2);
    }
    
    .stat-card:nth-child(2)::before {
      background: linear-gradient(90deg, #11998e, #38ef7d);
    }
    
    .stat-card:nth-child(3)::before {
      background: linear-gradient(90deg, #f093fb, #f5576c);
    }
    
    .stat-card:nth-child(4)::before {
      background: linear-gradient(90deg, #4facfe, #00f2fe);
    }
    
    .stat-card:hover {
      transform: translateY(-4px);
      border-color: rgba(102, 126, 234, 0.4);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
    }
    
    .stat-icon {
      font-size: 2rem;
      margin-bottom: 10px;
    }
    
    .stat-value {
      font-size: 2.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, #fff, #a0aec0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1.2;
    }
    
    .stat-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #8892b0;
      margin-top: 8px;
      font-weight: 600;
    }
    
    .section {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 30px;
      margin: 25px 0;
      backdrop-filter: blur(10px);
    }
    
    .section h2 {
      font-size: 1.3rem;
      font-weight: 700;
      margin-bottom: 20px;
      color: #ccd6f6;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .section h2 .icon {
      font-size: 1.5rem;
    }
    
    .endpoint-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 10px;
    }
    
    .endpoint-tag {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 0.8rem;
      font-family: 'SF Mono', 'Fira Code', 'Monaco', monospace;
      color: #a8d8ea;
      transition: all 0.2s ease;
      cursor: default;
    }
    
    .endpoint-tag:hover {
      background: rgba(102, 126, 234, 0.15);
      border-color: rgba(102, 126, 234, 0.4);
      color: #fff;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .info-row:last-child {
      border-bottom: none;
    }
    
    .info-label {
      color: #8892b0;
      font-size: 0.9rem;
    }
    
    .info-value {
      font-weight: 600;
      color: #ccd6f6;
      font-size: 0.9rem;
    }
    
    .info-value code {
      background: rgba(255, 255, 255, 0.08);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.85rem;
      color: #a8d8ea;
    }
    
    .footer {
      text-align: center;
      padding: 30px 20px;
      color: #556;
      font-size: 0.85rem;
    }
    
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    
    .footer a:hover {
      text-decoration: underline;
    }
    
    .timestamp {
      font-size: 0.75rem;
      color: #556;
      margin-top: 5px;
    }
    
    @media (max-width: 600px) {
      .header h1 { font-size: 1.8rem; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .stat-value { font-size: 1.8rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    
    <!-- CABEÇALHO -->
    <div class="header">
      <h1>🚀 Rododex API</h1>
      <p class="subtitle">Sistema de Espelho de Carga Digital</p>
      
      <div class="status-badge">
        <span class="status-dot"></span>
        <span>Sistema Online • v22.2</span>
      </div>
    </div>
    
    <!-- ESTATÍSTICAS -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📋</div>
        <div class="stat-value">${stats ? (stats.totalNotas || 0).toLocaleString('pt-BR') : '—'}</div>
        <div class="stat-label">Notas Fiscais</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-value">${stats ? (stats.totalMotoristas || 0) : '—'}</div>
        <div class="stat-label">Motoristas</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">📍</div>
        <div class="stat-value">${stats ? (stats.comEndereco || 0).toLocaleString('pt-BR') : '—'}</div>
        <div class="stat-label">Com Endereço</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-value">${stats ? (stats.totalVolumes || 0).toLocaleString('pt-BR') : '—'}</div>
        <div class="stat-label">Total Volumes</div>
      </div>
    </div>
    
    <!-- INFORMAÇÕES DO SISTEMA -->
    <div class="section">
      <h2><span class="icon">⚙️</span> Informações do Sistema</h2>
      
      <div class="info-row">
        <span class="info-label">Endpoint Principal</span>
        <span class="info-value"><code>POST /api/notas</code></span>
      </div>
      
      <div class="info-row">
        <span class="info-label">Método</span>
        <span class="info-value">POST com <code>{ "action": "..." }</code> no body</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">Acessos Ativos</span>
        <span class="info-value">${totalAcessosAtivos} motorista(s)</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">Versão</span>
        <span class="info-value">22.2 Premium</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">Cache 038</span>
        <span class="info-value">${stats && stats.totalNotas > 0 ? '✅ Carregado' : '⚠️ Vazio'}</span>
      </div>
      
      ${erroStats ? `
      <div class="info-row">
        <span class="info-label">Aviso</span>
        <span class="info-value" style="color: #ffab91;">⚠️ ${erroStats}</span>
      </div>
      ` : ''}
    </div>
    
    <!-- ENDPOINTS DISPONÍVEIS -->
    <div class="section">
      <h2><span class="icon">🔌</span> Actions Disponíveis</h2>
      <div class="endpoint-grid">
        <span class="endpoint-tag">obterTodosDados</span>
        <span class="endpoint-tag">getEstatisticas</span>
        <span class="endpoint-tag">obterMotoristas</span>
        <span class="endpoint-tag">salvarMotorista</span>
        <span class="endpoint-tag">deletarMotorista</span>
        <span class="endpoint-tag">salvarRascunho</span>
        <span class="endpoint-tag">obterRascunho</span>
        <span class="endpoint-tag">limparRascunho</span>
        <span class="endpoint-tag">liberarRoteiro</span>
        <span class="endpoint-tag">obterRoteiroAtivo</span>
        <span class="endpoint-tag">expirarRoteiro</span>
        <span class="endpoint-tag">obterAcessos</span>
        <span class="endpoint-tag">salvarAcesso</span>
        <span class="endpoint-tag">verificarAcesso</span>
        <span class="endpoint-tag">obterSenhaDoDia</span>
        <span class="endpoint-tag">validarLoginMotorista</span>
        <span class="endpoint-tag">registrarLogAcesso</span>
        <span class="endpoint-tag">obterLogsAcesso</span>
        <span class="endpoint-tag">buscarMultiplasNFs</span>
        <span class="endpoint-tag">importarNotas</span>
        <span class="endpoint-tag">processar035</span>
        <span class="endpoint-tag">salvarProdutosConferente</span>
        <span class="endpoint-tag">obterProdutosConferente</span>
        <span class="endpoint-tag">buscarProdutosPorNF</span>
        <span class="endpoint-tag">setupCompleto</span>
        <span class="endpoint-tag">limparDuplicatas</span>
        <span class="endpoint-tag">limparAba</span>
        <span class="endpoint-tag">recriarAba</span>
        <span class="endpoint-tag">listarAbas</span>
      </div>
    </div>
    
    <!-- EXEMPLO DE USO -->
    <div class="section">
      <h2><span class="icon">📝</span> Exemplo de Chamada</h2>
      <div class="info-row">
        <span class="info-label">URL</span>
        <span class="info-value"><code>POST /api/notas</code></span>
      </div>
      <div class="info-row">
        <span class="info-label">Headers</span>
        <span class="info-value"><code>Content-Type: application/json</code></span>
      </div>
      <div class="info-row">
        <span class="info-label">Body (exemplo)</span>
        <span class="info-value"><code>{ "action": "getEstatisticas" }</code></span>
      </div>
      <div class="info-row">
        <span class="info-label">Body (com dados)</span>
        <span class="info-value"><code>{ "action": "validarLoginMotorista", "motorista": "Nome", "senha": "1234" }</code></span>
      </div>
    </div>
    
    <!-- RODAPÉ -->
    <div class="footer">
      <p>Rododex Transportes • Espelho de Carga Digital</p>
      <p class="timestamp">🕐 ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
      <p style="margin-top: 8px;">
        <a href="/api/notas" target="_blank">/api/notas</a>
      </p>
    </div>
    
  </div>
  
  <!-- Auto-refresh a cada 60 segundos -->
  <script>
    setTimeout(() => location.reload(), 60000);
  </script>
</body>
</html>
  `);
}
