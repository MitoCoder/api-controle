// api/proxy.js - Versão Simplificada e Corrigida

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
    // ⭐⭐⭐ PEGAR ACTION DA URL - CORRIGIDO ⭐⭐⭐
    const url = new URL(req.url, `http://${req.headers.host}`);
    const action = url.searchParams.get('action');
    
    console.log('=== PROXY LOG ===');
    console.log('URL completa:', req.url);
    console.log('Action extraída:', action);
    console.log('Método:', req.method);
    console.log('Body presente:', !!req.body);

    if (!action) {
      console.error('❌ Action não encontrada na URL');
      return res.status(400).json({ 
        success: false, 
        message: 'Parâmetro "action" é obrigatório na URL',
        receivedUrl: req.url 
      });
    }

    // Construir URL final
    const targetUrl = `${SCRIPT_URL}?action=${action}`;
    console.log('🎯 URL destino:', targetUrl);

    // Configurar requisição
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (req.method === 'POST' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
      console.log('📦 Body tamanho:', fetchOptions.body.length);
    }

    // Fazer requisição
    const response = await fetch(targetUrl, fetchOptions);
    const text = await response.text();
    
    console.log('📡 Resposta recebida:', text.substring(0, 200));

    // Tentar parse JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { 
        success: false, 
        message: 'Resposta não-JSON',
        raw: text.substring(0, 100)
      };
    }

    return res.status(response.status).json(data);

  } catch (error) {
    console.error('💥 Erro fatal:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro no servidor proxy',
      error: error.message 
    });
  }
}
