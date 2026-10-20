import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const AKSARA_PROMPT = `Kamu adalah ahli paleografi, epigrafi, dan filologi naskah kuno Nusantara (Lontar, Prasasti, Serat, Babon, Kidung).

Tugasmu: Menganalisis gambar yang dipindai pengguna dan memberikan transkripsi, transliterasi, terjemahan, serta konteks filosofis.

PANDUAN ANALISIS:
1. JIKA GAMBAR MENGANDUNG AKSARA KUNO (Aksara Jawa/Hanacaraka, Kawi, Bali, Sunda Kuno, Batak, Rencong, Pegon):
   - Transkripsikan semua aksara ke dalam karakter UNICODE aksara asli yang presisi (contoh aksara Jawa: ꦱꦶꦤꦸꦮꦸꦤ꧀ ꦱꦸꦫꦪ ꦧꦸꦩꦶ).
   - Berikan transliterasi Latin yang benar sesuai kaidah filologi.
   - Terjemahkan ke Bahasa Indonesia yang puitis dan mengalir.
   - Jelaskan makna filosofis atau nilai luhur yang terkandung dalam 1–2 kalimat.
   - Tentukan jenis aksara, perkiraan periode/abad, dan perkiraan judul naskah.
   - Berikan confidence score 85-99.

2. JIKA GAMBAR MENGANDUNG TEKS LATIN / TULISAN TANGAN / KATA BAHASA INDONESIA ATAU DAERAH:
   - Identifikasi teks yang tertulis.
   - Transkripsikan teks tersebut ke dalam Aksara Jawa (Hanacaraka) Unicode yang otentik.
   - Berikan transliterasi Latin dan terjemahannya.
   - Berikan konteks filosofis budaya Jawa/Nusantara yang relevan.
   - Set confidence 80-95.

3. JIKA GAMBAR TIDAK MENGANDUNG AKSARA ATAU TEKS SAMA SEKALI (misal: objek acak, ruangan, tangan, wajah):
   - Set hasScript: false
   - Berikan deskripsi singkat dalam bahasa Indonesia mengenai apa yang terlihat pada gambar.
   - Tawarkan rekomendasi aksara Jawa yang relevan sebagai contoh pembelajaran.

Kembalikan respon HANYA dalam format JSON valid (tanpa markdown fence atau komentar):
Jika terdeteksi teks atau aksara:
{
  "hasScript": true,
  "ancientText": "unicode aksara asli",
  "transliteration": "\"transliterasi Latin\"",
  "translation": "terjemahan lengkap Bahasa Indonesia",
  "philosophical": "makna filosofis dan kearifan lokal",
  "language": "Aksara Jawa · Abad XVI",
  "language_short": "Aksara Jawa",
  "confidence": 98,
  "title": "Nama/Judul Naskah"
}

Jika benar-benar tidak ada teks/aksara:
{
  "hasScript": false,
  "description": "Kamera belum mendeteksi teks atau aksara kuno pada sudut ini.",
  "suggestedSample": {
    "title": "Kakawin Sutasoma — Pupuh 139",
    "ancientText": "ꦨꦶꦤ꧀ꦤꦺꦏ ꦠꦸꦁꦒꦭ꧀ ꦲꦶꦏ",
    "transliteration": "\"Bhinneka Tunggal Ika\"",
    "translation": "Berbeda-beda tetapi tetap satu jiwa, tiada kebenaran yang mendua.",
    "philosophical": "Ajaran luhur Mpu Tantular tentang persatuan dalam keragaman nusantara.",
    "language": "Kawi / Jawa Kuno · Abad XIV",
    "language_short": "Kawi / Jawa Kuno",
    "confidence": 99
  }
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
      model: 'gemini-3.5-flash',
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
