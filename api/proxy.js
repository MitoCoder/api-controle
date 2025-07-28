export default async function handler(req, res) {
  const API_URL = 'https://script.google.com/macros/s/AKfycby0P9N46bP4eYXVxUAojEcwjgtpIdg0M_f_6F8bZCDnziutKd7tGyUVcs59wp39ejR8/exec';

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  try {
    const response = await fetch(API_URL, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: req.method === 'POST' ? JSON.stringify(req.body) : undefined
    });

    const data = await response.text();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(response.status).send(data);
  } catch (error) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: 'Erro no proxy: ' + error.message });
  }
}
