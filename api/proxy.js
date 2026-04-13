// api/proxy.js - Proxy CORS para Google Apps Script

// URL do seu Google Apps Script
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxS8sqLREMnoymQ_1Dy5AZ_BQn7iN_2lx42Z9yKswcRSNCzppEn-ILXlB0CjdUav93PlA/exec';

// Cache em memória para GET (estatísticas)
let cache = {
  timestamp: 0,
  data: null,
};
const CACHE_DURATION_MS = 60 * 1000; // 1 minuto de cache

// Configuração de CORS
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

export default async function handler(req, res) {
  // Configurar CORS para todas as respostas
  setCorsHeaders(res);

  // Responder rapidamente a requisições OPTIONS (preflight CORS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // ⭐ EXTRAIR ACTION DA QUERY STRING
    const action = req.query.action;
    
    if (!action) {
      console.error('❌ Action não fornecida na query string');
      return res.status(400).json({ 
        success: false, 
        message: 'Parâmetro "action" é obrigatório na URL' 
      });
    }

    console.log(`🔄 Proxy: ${req.method} - action: ${action}`);

    // Construir a URL com o parâmetro action
    const url = new URL(SCRIPT_URL);
    url.searchParams.set('action', action);

    // Para requisições GET (estatísticas), verificar cache
    if (req.method === 'GET' && action === 'getEstatisticas') {
      const now = Date.now();
      if (cache.data && (now - cache.timestamp) < CACHE_DURATION_MS) {
        console.log('📦 Retornando cache de estatísticas');
        return res.status(200).json(cache.data);
      }
    }

    // Construir opções para o fetch
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Para POST, incluir o body como JSON
    if (req.method === 'POST') {
      fetchOptions.body = JSON.stringify(req.body);
      console.log(`📤 Enviando POST com body: ${fetchOptions.body.substring(0, 200)}...`);
    }

    // Fazer a requisição para o Google Apps Script
    const response = await fetch(url.toString(), fetchOptions);
    
    // Tentar ler a resposta como texto primeiro
    const text = await response.text();
    
    console.log(`📡 Resposta do Apps Script (${response.status}): ${text.substring(0, 300)}`);
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('❌ Resposta não é JSON:', text.substring(0, 200));
      data = { 
        success: false, 
        message: 'Resposta inválida do servidor', 
        raw: text.substring(0, 500) 
      };
    }

    // Atualizar cache para GET de estatísticas
    if (req.method === 'GET' && action === 'getEstatisticas' && data.success) {
      cache = {
        timestamp: Date.now(),
        data: data,
      };
      console.log('💾 Cache de estatísticas atualizado');
    }

    // Retornar a resposta com o mesmo status code
    return res.status(response.status).json(data);

  } catch (error) {
    console.error('❌ Erro no proxy:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro no servidor proxy', 
      error: error.message 
    });
  }
}
