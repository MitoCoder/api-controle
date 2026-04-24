// /api/index.js
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  return res.status(200).json({
    success: true,
    message: '🚀 Rododex API v22.2 - Online',
    endpoints: {
      principal: '/api/notas',
      acoes_disponiveis: [
        'obterTodosDados',
        'getEstatisticas',
        'obterMotoristas',
        'salvarMotorista',
        'deletarMotorista',
        'salvarRascunho',
        'obterRascunho',
        'limparRascunho',
        'liberarRoteiro',
        'obterRoteiroAtivo',
        'expirarRoteiro',
        'obterAcessos',
        'salvarAcesso',
        'verificarAcesso',
        'obterSenhaDoDia',
        'validarLoginMotorista',
        'registrarLogAcesso',
        'obterLogsAcesso',
        'buscarMultiplasNFs',
        'importarNotas',
        'processar035',
        'salvarProdutosConferente',
        'obterProdutosConferente',
        'setupCompleto',
        'limparDuplicatas',
        'limparAba',
        'recriarAba',
        'listarAbas'
      ],
      status: 'online',
      timestamp: new Date().toISOString()
    }
  });
}
