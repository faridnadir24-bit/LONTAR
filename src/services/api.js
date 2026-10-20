/**
 * AI Vision Multimodal Analysis API Service for LONTAR.ai
 */

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

export async function requestManuscriptAnalysis(base64Data, mimeType = 'image/jpeg') {
  const customKey = getCustomApiKey();
  const headers = { 'Content-Type': 'application/json' };
  if (customKey) {
    headers['x-gemini-api-key'] = customKey;
  }

  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      imageBase64: base64Data,
      mimeType,
      customApiKey: customKey || undefined,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errorMsg = errData.error || `Server error (${response.status})`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.errorType = errData.errorType;
    throw err;
  }

  return await response.json();
}
