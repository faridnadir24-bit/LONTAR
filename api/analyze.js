import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const AKSARA_PROMPT = `Kamu adalah pakar epigrafi, paleografi, dan filologi naskah kuno Nusantara dan Asia (mencakup Aksara Kawi/Jawa Kuno, Aksara Jawa/Hanacaraka/Carakan, Aksara Bali, Aksara Sunda Kuno & Sunda Baku, Aksara Batak Toba/Karo/Mandailing, Aksara Lontara/Bugis/Makassar, Aksara Rencong/Surat Ulu/Incung/Ka-Ga-Nga, Aksara Lampung/Had Lampung, Aksara Pegon & Jawi/Arab Melayu, Aksara Pallawa & Dewanagari/Sanskerta Nusantara, serta prasasti batu/tembaga dan daun lontar).

Tugasmu: Menganalisis gambar citra naskah yang dikirim dan menghasilkan pembacaan, transliterasi, dan terjemahan LENGKAP dan UTUH tanpa memotong teks, berapapun jumlah barisnya.

PANDUAN ANALISIS MULTI-BAHASA & MULTI-AKSARA KUNO:
1. IDENTIFIKASI AKSARA & BAHASA KUNO:
   - Kenali aksara apapun yang terlihat (Kawi, Jawa Kuno, Bali, Sunda, Batak, Lontara, Rencong, Lampung, Pegon, Pallawa, dll).
   - Tentukan ragam bahasa (Jawa Kuno/Kawi, Sansekerta, Melayu Kuno, Sunda Kuno, Bali Kuno, Bugis Kuno, Batak Kuno, Jawa Pertengahan/Baru, Arab-Pegon, dll).

2. JIKA CITRA BERISI BANYAK BARIS / TEKS PANJANG (prasasti, lembar lontar, serat, babad, atau tabel peraga aksara):
   - JANGAN MERINGKAS ATAU MEMOTONG TEKS! Transkripsikan SELURUH baris yang terlihat dari baris awal hingga akhir.
   - Pada "ancientText": tuliskan seluruh transkripsi aksara Unicode asli per baris, pisahkan dengan baris baru (\\n).
   - Pada "transliteration": berikan transliterasi Latin filologis lengkap untuk setiap baris ("Baris 1: ...\\nBaris 2: ...\\n...").
   - Pada "translation": terjemahkan seluruh baris secara utuh dan menyeluruh ke dalam Bahasa Indonesia yang mengalir, jelas, dan berbobot sastra.
   - Pada "philosophical": jelaskan konteks naskah, perkiraan abad/periode pembuatan, fungsi historis/spiritual, dan nilai adiluhung yang terkandung.
   - Pada "lineByLine": sediakan rincian array per baris: [{ "line": 1, "script": "...", "transliteration": "...", "translation": "..." }, ...].

3. JIKA CITRA BERISI TEKS LATIN / TULISAN TANGAN / KATA BAHASA INDONESIA ATAU DAERAH:
   - Identifikasi teks tertulis.
   - Transkripsikan teks ke dalam Aksara Nusantara yang relevan (misal Hanacaraka atau Kawi).
   - Berikan transliterasi Latin, terjemahan, dan konteks filosofis.
   - Confidence 85-95.

4. JIKA GAMBAR TIDAK MENGANDUNG AKSARA ATAU TEKS SAMA SEKALI (wajah, ruangan, benda acak):
   - Set hasScript: false
   - Berikan deskripsi ramah dalam bahasa Indonesia mengenai objek yang tertangkap.
   - Tawarkan rekomendasi naskah peraga Nusantara.

Kembalikan respon HANYA dalam format JSON valid (tanpa markdown fence atau komentar):
Jika terdeteksi teks atau aksara:
{
  "hasScript": true,
  "title": "Nama/Judul Naskah atau Prasasti",
  "language": "Kawi (Jawa Kuno) · Abad VIII–X M",
  "language_short": "Aksara Kawi",
  "script_type": "Kawi",
  "period": "Abad IX Masehi",
  "origin": "Jawa / Nusantara Kuno",
  "confidence": 98.8,
  "ancientText": "baris 1\\nbaris 2\\n...",
  "transliteration": "Baris 1: ...\\nBaris 2: ...\\n...",
  "translation": "Terjemahan lengkap seluruh baris...",
  "philosophical": "Penjelasan mendalam filologi dan nilai luhur...",
  "lineByLine": [
    { "line": 1, "script": "...", "transliteration": "...", "translation": "..." }
  ]
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

const CANDIDATE_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.5-flash'];

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-gemini-api-key'
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

  const { imageBase64, mimeType = 'image/jpeg', customApiKey } = req.body || {};
  const activeApiKey = customApiKey?.trim() || req.headers['x-gemini-api-key']?.trim() || GEMINI_API_KEY;

  if (!activeApiKey) {
    return res.status(500).json({
      errorType: 'MISSING_API_KEY',
      error: 'GEMINI_API_KEY belum dikonfigurasi di Vercel atau pengaturan aplikasi.',
    });
  }

  if (!imageBase64) {
    return res.status(400).json({ error: 'imageBase64 diperlukan.' });
  }

  let lastError = null;
  const ai = new GoogleGenAI({ apiKey: activeApiKey });

  // Try candidate models in order if one experiences rate-limit or error
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
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
      lastError = err;
      console.warn(`Model ${modelName} encountered error:`, err.message);
      // If error is not a quota issue, break or keep trying
      const isQuota = err.message && (err.message.includes('429') || err.message.includes('Quota exceeded') || err.message.includes('RESOURCE_EXHAUSTED'));
      if (!isQuota) {
        // If it's invalid key or bad request, don't waste time on next models
        break;
      }
    }
  }

  // If all models failed, parse and return human-friendly error
  const errMsg = lastError?.message || '';
  const isQuota = errMsg.includes('429') || errMsg.includes('Quota exceeded') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('exhausted');
  const isInvalidKey = errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key not valid') || errMsg.includes('403');

  if (isQuota) {
    return res.status(429).json({
      errorType: 'QUOTA_EXCEEDED',
      error: 'Batas kuota harian Gemini API (Free Tier) telah tercapai pada akun Google ini. Kuota akan direset otomatis oleh Google, atau Anda dapat memasukkan API Key pribadi dari Google AI Studio.',
    });
  }

  if (isInvalidKey) {
    return res.status(401).json({
      errorType: 'INVALID_API_KEY',
      error: 'Kunci API Gemini tidak valid atau izin akses ditolak oleh Google AI Studio.',
    });
  }

  return res.status(500).json({
    errorType: 'UNKNOWN_ERROR',
    error: 'Terjadi kendala saat menganalisis citra dengan layanan AI. Silakan periksa koneksi atau coba naskah peraga.',
  });
}
