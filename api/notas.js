// api/notas.js

export default async function handler(req, res) {
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxS8sqLREMnoymQ_1Dy5AZ_BQn7iN_2lx42Z9yKswcRSNCzppEn-ILXlB0CjdUav93PlA/exec';
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;
    
    if (!action) {
      return res.status(400).json({ 
        success: false, 
        message: 'Parâmetro "action" é obrigatório' 
      });
    }

    const targetUrl = `${SCRIPT_URL}?action=${action}`;
    
    const fetchOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: req.method === 'POST' ? JSON.stringify(req.body || {}) : undefined
    };

    const response = await fetch(targetUrl, fetchOptions);
    const text = await response.text();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: false, message: 'Resposta inválida do servidor' };
    }

    return res.status(response.status).json(data);

  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Erro na API: ' + error.message 
    });
  }
}
