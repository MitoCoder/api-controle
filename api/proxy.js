// api/proxy.js - PROXY COMPLETO PARA GOOGLE APPS SCRIPT

// ⭐ Configuração para aceitar payloads maiores
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
    responseLimit: '50mb',
  },
};

// URL do Google Apps Script
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxS8sqLREMnoymQ_1Dy5AZ_BQn7iN_2lx42Z9yKswcRSNCzppEn-ILXlB0CjdUav93PlA/exec';

export default async function handler(req, res) {
  // Configurar CORS para permitir qualquer origem
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Responder imediatamente a requisições OPTIONS (preflight CORS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('=== PROXY RECEBEU ===');
    console.log('Método:', req.method);
    console.log('Headers:', JSON.stringify(req.headers));
    console.log('Body presente:', !!req.body);
    
    if (req.body) {
      console.log('Action:', req.body.action);
      console.log('Body size:', JSON.stringify(req.body).length, 'bytes');
    }

    // Encaminhar a requisição exatamente como recebida para o Apps Script
    const response = await fetch(SCRIPT_URL, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
    });

    const text = await response.text();
    
    console.log('=== RESPOSTA DO APPS SCRIPT ===');
    console.log('Status:', response.status);
    console.log('Response size:', text.length, 'bytes');
    console.log('Response preview:', text.substring(0, 500));

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('❌ Erro ao parsear JSON:', e.message);
      console.error('Resposta bruta:', text);
      data = { 
        success: false, 
        message: 'Resposta inválida do servidor (não é JSON)',
        raw: text.substring(0, 200)
      };
    }

    // Retornar a resposta com o mesmo status code
    return res.status(response.status).json(data);

  } catch (error) {
    console.error('💥 ERRO FATAL NO PROXY:', error);
    console.error('Stack:', error.stack);
    
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno no proxy',
      error: error.message 
    });
  }
}
