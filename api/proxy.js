// Handler da API proxy com cache simples e CORS
const API_URL = process.env.API_URL || 'https://script.google.com/macros/s/AKfycbwXJ08wvmWHiLFGNvcj-ZxriG2JTGnl3gPgBf-EcpZhwrIxjm0DTaRkUFzJJKHcQxO0/exec';
const CACHE_DURATION_MS = 30 * 1000; // 30 segundos cache para GET

// Cache simples em memória
let cache = {
  timestamp: 0,
  data: null,
  status: 200,
};

// Middleware para CORS
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Função principal do handler
export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    // Resposta rápida para preflight CORS
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    const now = Date.now();
    if (cache.data && (now - cache.timestamp) < CACHE_DURATION_MS) {
      // Retorna cache válido
      return res.status(cache.status).json(cache.data);
    }
  }

  try {
    const fetchOptions = {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
    };

    const response = await fetch(API_URL, fetchOptions);

    // Supondo que a API retorna JSON
    const data = await response.json();

    if (req.method === 'GET' && response.ok) {
      // Atualiza cache somente se a resposta foi OK
      cache = {
        timestamp: Date.now(),
        data,
        status: response.status,
      };
    }

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Erro no proxy:', error);
    return res.status(500).json({ error: 'Erro no proxy: ' + error.message });
  }
}
