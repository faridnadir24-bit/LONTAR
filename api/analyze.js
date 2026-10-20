import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const AKSARA_PROMPT = `Kamu adalah mahaguru dan pakar otoritas tertinggi dalam bidang epigrafi, paleografi, dan filologi naskah kuno Nusantara dan Asia Tenggara (mencakup Aksara Kawi/Jawa Kuno, Aksara Jawa/Hanacaraka/Carakan, Aksara Bali, Aksara Sunda Kuno & Sunda Baku, Aksara Batak Toba/Karo/Mandailing, Aksara Lontara/Bugis/Makassar, Aksara Rencong/Surat Ulu/Incung/Ka-Ga-Nga, Aksara Lampung/Had Lampung, Aksara Pegon & Jawi/Arab Melayu, Aksara Pallawa & Dewanagari/Sanskerta Nusantara, prasasti batu/tembaga, serta lembar lontar).

Tugasmu: Menganalisis citra naskah kuno dengan standar akademis filologi tertinggi (merujuk standar P.J. Zoetmulder, S.O. Robson, L. Mardiwarsito, J.G. de Casparis) agar pembacaan, alih aksara (transliterasi), dan terjemahan akurat 100%, bebas kesalahan tafsir atau halusinasi.

KAIDAH EPIGRAFI & FILOLOGI KETAT:
1. IDENTIFIKASI AKSARA, BAHASA, & GENRE:
   - Kenali aksara secara presisi: Kawi (Kuno/Pertengahan/Akhir), Carakan/Jawa Baru, Bali Kuno/Baru, Sunda Kuno, Batak, Lontara, Rencong/Ulu, Pegon, Pallawa.
   - Tentukan ragam bahasa: Jawa Kuno (Old Javanese), Sanskerta Nusantara, Melayu Kuno (Old Malay), Sunda Kuno, Bali Kuno, Bugis Kuno, Batak Kuno, Jawa Pertengahan/Baru, Arab-Melayu/Pegon.
   - Kenali genre teks: Piagam penetapan sima (sīma charter), piagam sumpah/kutukan (śapatha), kakawin bermetrum wirama/chanda, serat piwulang, babad sejarah, mantra keagamaan, atau tabel abjad/varṇamālā (kumpulan peraga aksara dan konjungsi vokal).

2. PENANGANAN SCRIPTIO CONTINUA & HUKUM SANDHI:
   - Naskah kuno umumnya ditulis tanpa spasi (scriptio continua). Kamu WAJIB melakukan segmentasi kata (word segmentation) yang tepat dan membedah peleburan vokal/konsonan (sandhi) berdasarkan leksikon filologis yang sahih (contoh: 'tatastu' = tata + astu; 'bhinneka' = bhinna + ika; 'mangrwa' = ma- + rwa).
   - Gunakan transliterasi fonetis standar filologi ilmiah / IAST (ā, ī, ū, ṛ, ṣ, ś, ñ, ṅ, ṭ, ḍ, ḥ).

3. TRANSKRIPSI LENGKAP & UTUH SELURUH BARIS:
   - JANGAN PERNAH memotong, menyingkat, atau menghilangkan baris! Transkripsikan SELURUH baris dari baris 1 sampai baris terakhir yang tertangkap pada gambar.
   - Pada "ancientText": tuliskan seluruh transkripsi aksara Unicode asli per baris, pisahkan dengan newline (\\n).
   - Pada "transliteration": transliterasi Latin filologis presisi per baris ("Baris 1: ...\\nBaris 2: ...\\n...").
   - Pada "translation": terjemahan Bahasa Indonesia yang koheren, mengalir indah, setia pada makna gramatikal naskah asli tanpa mengarang bebas.
   - Pada "philosophical": ulasan mendalam konteks sosio-historis, tafsir filologis, dan nilai kearifan adiluhung yang terkandung.
   - Pada "lineByLine": rincian array per baris: [{ "line": 1, "script": "...", "transliteration": "...", "translation": "..." }, ...].
   - Pada "lexicon": WAJIB sediakan array 3–5 istilah kuno kunci/morfologi kata penting yang diurai asal-usul etimologisnya:
     [
       { "term": "...", "origin": "Sanskerta / Jawa Kuno / Melayu Kuno", "meaning": "Makna harfiah leksikal dan peran filosofisnya dalam naskah" }
     ]

4. JIKA GAMBAR BERUPA TULISAN TANGAN LATIN / KATA DAERAH / INDONESIA:
   - Transkripsikan kata-kata tersebut ke dalam Aksara Nusantara yang sesuai (misal Carakan atau Kawi).
   - Berikan transliterasi, terjemahan, konteks, dan glosarium. Confidence: 85-95.

5. JIKA GAMBAR SAMA SEKALI TIDAK MENGANDUNG AKSARA/TEKS (wajah, ruangan, pakaian, benda acak):
   - Set hasScript: false.
   - Berikan "description" ramah mengapa teks tidak ditemukan, dan tawarkan "suggestedSample" naskah peraga.

Kembalikan respon HANYA dalam format JSON valid (tanpa pembungkus markdown atau komentar luar):
Jika terdeteksi teks atau aksara:
{
  "hasScript": true,
  "title": "Nama/Judul Naskah atau Prasasti",
  "language": "Kawi (Jawa Kuno) · Abad VIII–X M",
  "language_short": "Aksara Kawi",
  "script_type": "Kawi",
  "period": "Abad IX Masehi",
  "origin": "Jawa / Nusantara Kuno",
  "confidence": 99.2,
  "ancientText": "baris 1\\nbaris 2\\n...",
  "transliteration": "Baris 1: ...\\nBaris 2: ...\\n...",
  "translation": "Terjemahan lengkap seluruh baris...",
  "philosophical": "Penjelasan mendalam filologi dan nilai luhur...",
  "lineByLine": [
    { "line": 1, "script": "...", "transliteration": "...", "translation": "..." }
  ],
  "lexicon": [
    { "term": "Istilah 1", "origin": "Jawa Kuno / Sanskerta", "meaning": "Arti dan telaah morfologi..." },
    { "term": "Istilah 2", "origin": "Sanskerta", "meaning": "Arti dan telaah morfologi..." }
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
    "confidence": 99.5,
    "lexicon": [
      { "term": "Bhinneka", "origin": "Jawa Kuno (bhinna + ika)", "meaning": "Beraneka ragam namun sejatinya berpangkal pada satu hakikat." },
      { "term": "Tunggal", "origin": "Jawa Kuno / Austronesia", "meaning": "Satu, esa, tak terpisahkan." },
      { "term": "Ika", "origin": "Jawa Kuno", "meaning": "Itu / demikianlah keadaannya." }
    ]
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
