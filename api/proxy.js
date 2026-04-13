// api/proxy.js - Proxy CORS para Google Apps Script (VERSÃO FINAL CORRIGIDA)

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxS8sqLREMnoymQ_1Dy5AZ_BQn7iN_2lx42Z9yKswcRSNCzppEn-ILXlB0CjdUav93PlA/exec';

// ⭐ Desabilitar bodyParser do Vercel para receber raw body
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Responder a OPTIONS (preflight CORS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Pegar action da query string
    const { action } = req.query;
    
    console.log('=== PROXY RECEBEU ===');
    console.log('Método:', req.method);
    console.log('Action:', action);
    console.log('Query:', req.query);
    console.log('Body recebido:', req.body ? 'SIM' : 'NÃO');
    
    if (!action) {
      console.error('❌ Action não fornecida');
      return res.status(400).json({ 
        success: false, 
        message: 'Parâmetro "action" é obrigatório na URL' 
      });
    }

    // Construir URL do Apps Script
    const targetUrl = `${SCRIPT_URL}?action=${action}`;
    console.log('🎯 URL destino:', targetUrl);

    // Configurar fetch
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // ⭐ Só adicionar body se for POST E tiver dados
    if (req.method === 'POST' && req.body && Object.keys(req.body).length > 0) {
      fetchOptions.body = JSON.stringify(req.body);
      console.log('📦 Body tamanho:', fetchOptions.body.length, 'bytes');
      console.log('📦 Body preview:', fetchOptions.body.substring(0, 200));
    } else if (req.method === 'POST') {
      console.warn('⚠️ POST sem body!');
    }

    // Fazer requisição ao Apps Script
    const response = await fetch(targetUrl, fetchOptions);
    const text = await response.text();
    
    console.log('📡 Resposta Apps Script:', text.substring(0, 300));
    console.log('📡 Status:', response.status);

    // Tentar parse JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('❌ Resposta não é JSON:', text);
      data = { 
        success: false, 
        message: 'Resposta inválida do Apps Script',
        raw: text.substring(0, 200)
      };
    }

    // Retornar com o mesmo status
    return res.status(response.status).json(data);

  } catch (error) {
    console.error('💥 ERRO FATAL NO PROXY:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno no proxy',
      error: error.message 
    });
  }
}
