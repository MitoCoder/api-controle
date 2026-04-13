// /api/notas.js

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxS8sqLREMnoymQ_1Dy5AZ_BQn7iN_2lx42Z9yKswcRSNCzppEn-ILXlB0CjdUav93PlA/exec';

export default async function handler(req, res) {

  // =========================================
  // CORS (LIBERA GERAL)
  // =========================================
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {

    // =========================================
    // CAPTURAR ACTION (QUERY OU BODY)
    // =========================================
    const action = req.query.action || req.body?.action;

    if (!action) {
      return res.status(400).json({
        success: false,
        message: 'Action não fornecida'
      });
    }

    console.log('➡️ Action:', action);

    // =========================================
    // PREPARAR PAYLOAD
    // =========================================
    const payload = {
      ...req.body,
      action // garante que sempre vai junto
    };

    // =========================================
    // CHAMAR APPS SCRIPT
    // =========================================
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();

    console.log('📥 Resposta bruta:', text.substring(0, 200));

    // =========================================
    // PARSE SEGURO
    // =========================================
    let data;

    try {
      data = JSON.parse(text);
    } catch (err) {
      data = {
        success: false,
        message: 'Resposta inválida do Apps Script',
        raw: text
      };
    }

    // =========================================
    // RETORNAR PRO FRONT
    // =========================================
    return res.status(200).json(data);

  } catch (error) {

    console.error('💥 ERRO API:', error);

    return res.status(500).json({
      success: false,
      message: 'Erro interno: ' + error.message
    });
  }
}
