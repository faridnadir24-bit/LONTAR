import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const AKSARA_PROMPT = `Kamu adalah ahli epigrafi dan paleografi Indonesia, terlatih membaca manuskrip lontar, prasasti, dan serat kuno.

Analisis gambar ini dengan sangat cermat untuk mendeteksi aksara kuno Nusantara.

JIKA gambar mengandung aksara Jawa (Hanacaraka/Carakan), aksara Kawi, aksara Bali, aksara Sunda kuno, atau aksara Nusantara lainnya:
1. Transkripsi semua aksara yang terlihat dalam unicode aksara asli (contoh: ꦱꦶꦤꦸꦮꦸꦤ꧀)
2. Berikan transliterasi Latin yang akurat sesuai kaidah filologi
3. Terjemahkan ke Bahasa Indonesia yang natural dan mengalir
4. Berikan konteks filosofis atau historis singkat (1–2 kalimat)
5. Identifikasi jenis aksara dan perkiraan periode/abad penulisan
6. Berikan tingkat kepercayaan (confidence) 0–100

JIKA gambar TIDAK mengandung aksara kuno Nusantara manapun:
- Set hasScript: false
- Jelaskan apa yang terlihat dalam kolom "description"

Kembalikan HANYA JSON valid tanpa markdown code block, tanpa tanda kutip luar, tanpa komentar:
{
  "hasScript": true,
  "ancientText": "unicode aksara asli yang terdeteksi",
  "transliteration": "transliterasi Latin (dalam tanda kutip ganda)",
  "translation": "terjemahan lengkap ke Bahasa Indonesia",
  "philosophical": "konteks filosofis atau historis",
  "language": "jenis aksara · perkiraan abad (contoh: Aksara Jawa · Abad XVI)",
  "language_short": "jenis aksara saja (contoh: Aksara Jawa)",
  "confidence": 95,
  "title": "perkiraan judul atau nama teks jika diketahui"
}

Jika hasScript false:
{
  "hasScript": false,
  "description": "deskripsi singkat apa yang terlihat",
  "confidence": 0
}`;

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', service: 'LONTAR-AI Vision' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not configured in environment variables.',
    });
  }

  const { imageBase64, mimeType = 'image/jpeg' } = req.body || {};

  if (!imageBase64) {
    return res.status(400).json({ error: 'imageBase64 diperlukan.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: AKSARA_PROMPT },
            { inlineData: { mimeType, data: imageBase64 } },
          ],
        },
      ],
    });

    const rawText = response.text?.trim() ?? '';
    let cleaned = rawText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    if (!cleaned.startsWith('{')) {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) cleaned = match[0];
    }

    const parsed = JSON.parse(cleaned);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Gemini API error in Vercel function:', err);
    return res.status(500).json({
      error: err.message || 'Terjadi kesalahan saat memproses gambar.',
    });
  }
}
