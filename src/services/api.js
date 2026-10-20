/**
 * AI Vision Multimodal Analysis API Service for LONTAR.ai
 */

// Client-side cache to guarantee 100% deterministic results when scanning identical images
const clientAnalysisCache = new Map();

function getImageFingerprint(base64Data) {
  if (!base64Data) return '';
  const len = base64Data.length;
  const head = base64Data.slice(0, 120);
  const q1 = base64Data.slice(Math.floor(len * 0.25), Math.floor(len * 0.25) + 120);
  const mid = base64Data.slice(Math.floor(len * 0.5), Math.floor(len * 0.5) + 120);
  const q3 = base64Data.slice(Math.floor(len * 0.75), Math.floor(len * 0.75) + 120);
  const tail = base64Data.slice(-120);
  return `${len}:${head}:${q1}:${mid}:${q3}:${tail}`;
}

export function getCustomApiKey() {
  try {
    return localStorage.getItem('lontar_custom_gemini_key') || '';
  } catch {
    return '';
  }
}

export function setCustomApiKey(key) {
  try {
    if (key && key.trim()) {
      localStorage.setItem('lontar_custom_gemini_key', key.trim());
    } else {
      localStorage.removeItem('lontar_custom_gemini_key');
    }
  } catch (e) {
    console.warn('Unable to persist custom API key in localStorage:', e);
  }
}

export async function requestManuscriptAnalysis(base64Data, mimeType = 'image/jpeg', options = {}) {
  const { signal, timeoutMs = 15000 } = options;

  const fingerprint = getImageFingerprint(base64Data);
  if (fingerprint && clientAnalysisCache.has(fingerprint)) {
    return JSON.parse(JSON.stringify(clientAnalysisCache.get(fingerprint)));
  }

  const customKey = getCustomApiKey();
  const headers = { 'Content-Type': 'application/json' };
  if (customKey) {
    headers['x-gemini-api-key'] = customKey;
  }

  // Set up timeout controller combined with external caller signal
  const abortCtrl = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    abortCtrl.abort();
  }, timeoutMs);

  if (signal) {
    if (signal.aborted) {
      clearTimeout(timer);
      const cancelErr = new Error('Pemindaian dibatalkan.');
      cancelErr.errorType = 'CANCELLED';
      throw cancelErr;
    }
    signal.addEventListener('abort', () => abortCtrl.abort(signal.reason), { once: true });
  }

  let response;
  try {
    response = await fetch('/api/analyze', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        imageBase64: base64Data,
        mimeType,
        customApiKey: customKey || undefined,
      }),
      signal: abortCtrl.signal,
    });
  } catch (fetchErr) {
    clearTimeout(timer);
    if (timedOut) {
      const timeoutError = new Error('Waktu analisis melebihi batas (koneksi lambat atau server sibuk).');
      timeoutError.status = 408;
      timeoutError.errorType = 'TIMEOUT';
      throw timeoutError;
    }
    if (signal && signal.aborted) {
      const cancelError = new Error('Pemindaian dibatalkan.');
      cancelError.errorType = 'CANCELLED';
      throw cancelError;
    }
    throw fetchErr;
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errorMsg = errData.error || `Server error (${response.status})`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.errorType = errData.errorType || (response.status === 504 || response.status === 408 ? 'TIMEOUT' : 'UNKNOWN_ERROR');
    throw err;
  }

  const data = await response.json();
  if (fingerprint && data && data.hasScript !== undefined) {
    clientAnalysisCache.set(fingerprint, data);
    if (clientAnalysisCache.size > 100) {
      const oldestKey = clientAnalysisCache.keys().next().value;
      clientAnalysisCache.delete(oldestKey);
    }
  }

  return data;
}
