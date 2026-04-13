export default async function handler(req, res) {
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxS8sqLREMnoymQ_1Dy5AZ_BQn7iN_2lx42Z9yKswcRSNCzppEn-ILXlB0CjdUav93PlA/exec';

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // ✅ ACEITA BODY OU QUERY
    const action = req.query.action || req.body?.action;

    if (!action) {
      return res.status(400).json({
        success: false,
        message: 'Action não fornecida'
      });
    }

    // 🔥 ENVIA TUDO PRO APPS SCRIPT VIA BODY
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body || {})
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = {
        success: false,
        message: 'Resposta inválida do Apps Script',
        raw: text
      };
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro na API: ' + error.message
    });
  }
}
