const ACTIONS = new Set([
  'obterTodosDados', 'getEstatisticas', 'obterMotoristas',
  'salvarMotorista', 'deletarMotorista', 'salvarRascunho',
  'obterRascunho', 'limparRascunho', 'liberarRoteiro',
  'obterRoteiroAtivo', 'expirarRoteiro', 'obterAcessos',
  'salvarAcesso', 'verificarAcesso', 'obterSenhaDoDia',
  'validarLoginMotorista', 'registrarLogAcesso', 'obterLogsAcesso',
  'buscarMultiplasNFs', 'importarNotas', 'importar', 'processar035',
  'salvarProdutosConferente', 'obterProdutosConferente',
  'buscarProdutosPorNF', 'setupCompleto', 'limparDuplicatas',
  'limparAba', 'recriarAba', 'listarAbas'
]);

const READ_ACTIONS = new Set([
  'obterTodosDados', 'getEstatisticas', 'obterMotoristas',
  'obterRascunho', 'obterRoteiroAtivo', 'obterAcessos',
  'obterSenhaDoDia', 'obterLogsAcesso', 'buscarMultiplasNFs',
  'obterProdutosConferente', 'buscarProdutosPorNF', 'listarAbas'
]);

export function normalizeAction(action) {
  if (!action || typeof action !== 'string') return '';
  const clean = action.trim();
  if (clean === 'importarNotas') return 'importar';
  return clean;
}

export function isAllowedAction(action) {
  return ACTIONS.has(action);
}

export function shouldCacheAction(action) {
  return READ_ACTIONS.has(action);
}
