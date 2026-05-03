const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxS8sqLREMnoymQ_1Dy5AZ_BQn7iN_2lx42Z9yKswcRSNCzppEn-ILXlB0CjdUav93PlA/exec';

const DEFAULT_TIMEOUT_MS = 25000;
const DEFAULT_RETRIES = 3;
const RETRYABLE_HTTP_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

const cache = new Map();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function makeCacheKey(payload) {
  return JSON.stringify(payload);
}

export function getCached(payload) {
  const key = makeCacheKey(payload);
  const entry = cache.get(key);

  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.value;
}

export function setCached(payload, value, ttlMs) {
  if (!ttlMs || ttlMs <= 0) return;

  const key = makeCacheKey(payload);
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs
  });
}

export async function callAppsScript(payload, options = {}) {
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  const maxRetries = options.maxRetries || DEFAULT_RETRIES;

  for (let tentativa = 1; tentativa <= maxRetries; tentativa += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Resposta invalida do Apps Script');
      }

      if (!response.ok) {
        const err = new Error(data?.message || `Falha HTTP ${response.status}`);
        err.status = response.status;
        throw err;
      }

      return data;
    } catch (error) {
      const timedOut = error?.name === 'AbortError';
      const retryableStatus = RETRYABLE_HTTP_STATUS.has(Number(error?.status));
      const shouldRetry = tentativa < maxRetries && (timedOut || retryableStatus || !error?.status);

      if (!shouldRetry) throw error;
      await delay(400 * tentativa);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error('Falha inesperada na chamada ao Apps Script');
}
