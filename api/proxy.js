// api/proxy.js - Proxy CORS para Google Apps Script

// ⭐ URL DO SEU NOVO GOOGLE APPS SCRIPT
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
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 horas
}

// Função principal do handler
export default async function handler(req, res) {
  // Configurar CORS para todas as respostas
  setCorsHeaders(res);

  // Responder rapidamente a requisições OPTIONS (preflight CORS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const url = new URL(SCRIPT_URL);
    
    // Extrair a action dos parâmetros da query
    const action = req.query.action;
    if (action) {
      url.searchParams.set('action', action);
    }

    console.log(`🔄 Proxy: ${req.method} ${url.toString()}`);

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

    // Para POST, incluir o body
    if (req.method === 'POST') {
      fetchOptions.body = JSON.stringify(req.body);
    }

    // Fazer a requisição para o Google Apps Script
    const response = await fetch(url.toString(), fetchOptions);
    
    // Tentar ler a resposta como texto primeiro
    const text = await response.text();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      // Se não for JSON, retornar como texto
      data = { 
        success: false, 
        message: 'Resposta não-JSON do servidor', 
        raw: text.substring(0, 500) 
      };
    }

    console.log(`✅ Resposta do Apps Script: ${response.status}`);

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
