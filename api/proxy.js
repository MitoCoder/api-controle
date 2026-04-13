// api/proxy.js - CORREÇÃO FINAL

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxS8sqLREMnoymQ_1Dy5AZ_BQn7iN_2lx42Z9yKswcRSNCzppEn-ILXlB0CjdUav93PlA/exec';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // ⭐⭐⭐ PEGAR ACTION DA URL (QUERY STRING) ⭐⭐⭐
    const { action } = req.query;
    
    console.log('=== PROXY ===');
    console.log('Action recebida:', action);
    console.log('Método:', req.method);
    console.log('Query completa:', req.query);

    if (!action) {
      return res.status(400).json({ 
        success: false, 
        message: 'Parâmetro "action" é obrigatório na URL' 
      });
    }

    // ⭐⭐⭐ CONSTRUIR URL COM ACTION ⭐⭐⭐
    const targetUrl = `${SCRIPT_URL}?action=${action}`;
    console.log('URL destino:', targetUrl);

    // ⭐⭐⭐ ENCAMINHAR REQUISIÇÃO ⭐⭐⭐
    const fetchOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body || {})
    };

    const response = await fetch(targetUrl, fetchOptions);
    const text = await response.text();
    
    console.log('Resposta Apps Script:', text.substring(0, 200));

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: false, message: 'Resposta inválida do servidor' };
    }

    return res.status(response.status).json(data);

  } catch (error) {
    console.error('Erro no proxy:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro no proxy: ' + error.message 
    });
  }
}
