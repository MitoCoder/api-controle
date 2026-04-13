// api/notas.js

export default async function handler(req, res) {
  // URL do Google Apps Script
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxS8sqLREMnoymQ_1Dy5AZ_BQn7iN_2lx42Z9yKswcRSNCzppEn-ILXlB0CjdUav93PlA/exec';
  
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responder ao preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Pegar action da URL
    const { action } = req.query;
    
    console.log('Notas API - Action:', action);
    console.log('Notas API - Method:', req.method);

    if (!action) {
      return res.status(400).json({ 
        success: false, 
        message: 'Parâmetro "action" é obrigatório' 
      });
    }

    // Construir URL do Apps Script
    const targetUrl = `${SCRIPT_URL}?action=${action}`;
    console.log('Target URL:', targetUrl);

    // Configurar requisição
    const fetchOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: req.method === 'POST' ? JSON.stringify(req.body || {}) : undefined
    };

    // Chamar Apps Script
    const response = await fetch(targetUrl, fetchOptions);
    const text = await response.text();
    
    console.log('Apps Script response:', text.substring(0, 200));

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: false, message: 'Resposta inválida do servidor' };
    }

    return res.status(response.status).json(data);

  } catch (error) {
    console.error('Erro na API notas:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno: ' + error.message 
    });
  }
}
