// api/proxy.js - Proxy CORS para Google Apps Script (VERSÃO CORRIGIDA)

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxS8sqLREMnoymQ_1Dy5AZ_BQn7iN_2lx42Z9yKswcRSNCzppEn-ILXlB0CjdUav93PlA/exec';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // ⭐ PEGAR ACTION DA URL (QUERY STRING)
    const action = req.query.action;
    
    console.log('🔵 Proxy recebeu:', {
      method: req.method,
      action: action,
      query: req.query,
      body: req.body ? 'present' : 'empty'
    });

    if (!action) {
      console.error('❌ Action não fornecida');
      return res.status(400).json({ 
        success: false, 
        message: 'Parâmetro "action" é obrigatório' 
      });
    }

    // ⭐ CONSTRUIR URL CORRETAMENTE
    const url = `${SCRIPT_URL}?action=${action}`;
    console.log('🔗 URL do Apps Script:', url);

    // ⭐ PREPARAR BODY PARA POST
    let body = undefined;
    if (req.method === 'POST' && req.body) {
      body = JSON.stringify(req.body);
      console.log('📦 Body size:', body.length, 'bytes');
    }

    // ⭐ FAZER REQUISIÇÃO AO GOOGLE APPS SCRIPT
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    });

    const text = await response.text();
    console.log('📡 Resposta do Apps Script:', text.substring(0, 200));

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('❌ Resposta não é JSON:', text);
      data = { 
        success: false, 
        message: 'Resposta inválida do servidor',
        raw: text 
      };
    }

    return res.status(response.status).json(data);

  } catch (error) {
    console.error('💥 Erro no proxy:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro no proxy: ' + error.message 
    });
  }
}
