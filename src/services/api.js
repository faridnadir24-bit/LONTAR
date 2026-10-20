/**
 * AI Vision Multimodal Analysis API Service for LONTAR.ai
 */

export async function requestManuscriptAnalysis(base64Data, mimeType = 'image/jpeg') {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: base64Data, mimeType }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Server status ${response.status}`);
  }

  return await response.json();
}
