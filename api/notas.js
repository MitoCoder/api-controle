// /api/notas.js

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxS8sqLREMnoymQ_1Dy5AZ_BQn7iN_2lx42Z9yKswcRSNCzppEn-ILXlB0CjdUav93PlA/exec';

// 🔥 CONFIGURAÇÃO PROFISSIONAL
const TAMANHO_LOTE = 200; // ideal pro Apps Script
const MAX_RETRY = 3;
const DELAY_ENTRE_LOTES = 200; // ms

// ⏱️ delay helper
const delay = (ms) => new Promise(res => setTimeout(res, ms));

// 🔁 retry inteligente
const enviarComRetry = async (payload, tentativa = 1) => {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await response.text();

    try {
      return JSON.parse(text);
    } catch {
      throw new Error('Resposta inválida');
    }

  } catch (err) {

    if (tentativa < MAX_RETRY) {
      console.log(`🔁 Retry ${tentativa}...`);
      await delay(500 * tentativa);
      return enviarComRetry(payload, tentativa + 1);
    }

    throw err;
  }
};

export default async function handler(req, res) {

  // =========================================
  // CORS
  // =========================================
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {

    const action = req.query.action || req.body?.action;

    if (!action) {
      return res.status(400).json({
        success: false,
        message: 'Action não fornecida'
      });
    }

    console.log('➡️ Action:', action);

    const dados = req.body?.dados;

    // =========================================
    // 🔥 SE FOR IMPORTAÇÃO GRANDE
    // =========================================
    if (action === 'importar' && Array.isArray(dados)) {

      const total = dados.length;
      let enviados = 0;
      let sucesso = 0;

      console.log(`📦 Total de registros: ${total}`);

      for (let i = 0; i < total; i += TAMANHO_LOTE) {

        const lote = dados.slice(i, i + TAMANHO_LOTE);

        const payload = {
          action,
          dados: lote
        };

        console.log(`🚀 Enviando lote ${i / TAMANHO_LOTE + 1}`);

        const resposta = await enviarComRetry(payload);

        if (!resposta.success) {
          throw new Error(resposta.message || 'Erro no lote');
        }

        enviados += lote.length;
        sucesso += resposta.novas || lote.length;

        console.log(`✅ Progresso: ${enviados}/${total}`);

        // evita travar Apps Script
        await delay(DELAY_ENTRE_LOTES);
      }

      return res.status(200).json({
        success: true,
        novas: sucesso,
        total
      });
    }

    // =========================================
    // 🔥 OUTRAS AÇÕES (SEM ALTERAÇÃO)
    // =========================================
    const payload = {
      ...req.body,
      action
    };

    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = {
        success: false,
        message: 'Resposta inválida do Apps Script',
        raw: text
      };
    }

    return res.status(200).json(data);

  } catch (error) {

    console.error('💥 ERRO API:', error);

    return res.status(500).json({
      success: false,
      message: 'Erro interno: ' + error.message
    });
  }
}
