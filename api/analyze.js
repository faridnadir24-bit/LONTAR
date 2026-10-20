import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// In-memory determinism & quota-saving cache for identical images
const scanCache = new Map();

const AKSARA_PROMPT = `Kamu adalah mahaguru dan pakar otoritas tertinggi dalam bidang epigrafi, paleografi, dan filologi naskah kuno Nusantara dan Asia Tenggara (mencakup Aksara Kawi/Jawa Kuno, Aksara Jawa/Hanacaraka/Carakan, Aksara Bali, Aksara Sunda Kuno & Sunda Baku, Aksara Batak Toba/Karo/Mandailing, Aksara Lontara/Bugis/Makassar, Aksara Rencong/Surat Ulu/Incung/Ka-Ga-Nga, Aksara Lampung/Had Lampung, Aksara Pegon & Jawi/Arab Melayu, Aksara Pallawa & Dewanagari/Sanskerta Nusantara, prasasti batu/tembaga, serta lembar lontar).

Tugasmu: Menganalisis citra naskah kuno dengan standar akademis filologi tertinggi (merujuk standar P.J. Zoetmulder, S.O. Robson, L. Mardiwarsito, J.G. de Casparis) agar pembacaan, alih aksara (transliterasi), dan terjemahan akurat 100%, bebas kesalahan tafsir atau halusinasi.

ATURAN FORMAT PENULISAN TEKS (SANGAT KRUSIAL - BACA TELITI):
1. DILARANG KERAS MENULISKAN LABEL PENOMORAN SEPERTI "baris 1", "baris 2", "Baris 1:", "Baris 2:", "baris 3", ATAU SEJENISNYA! Pengguna sangat bingung jika melihat kata "baris 1", "baris 2", dll.
2. DILARANG MENULISKAN KOMENTAR META SEPERTI "(tampak tertera pada naskah daun lontar/daluang)" ke dalam teks aksara! Teks harus murni berisi kata-kata naskah asli.
3. DILARANG KERAS MENGHASILKAN KATA HALUSINASI BERULANG ATAU GAGAP SUKU KATA (seperti kata tanpa arti yang diulang-ulang 'tatarikantiri...'). Setiap kata Latin harus berupa kata filologi yang bermakna nyata dan dipisahkan dengan SPASI yang jelas, bukan digabung menjadi satu kata raksasa!
4. Pada "ancientText": Tuliskan HANYA karakter aksara Unicode asli murni (misal aksara Kawi, Jawa, Bali, Sunda, Batak, Lontara, Pegon) yang terbaca secara berurutan dan mengalir alami. Jika naskah terdiri dari beberapa baris fisik, pisahkan langsung dengan baris baru (\n) TANPA awalan kata "baris". DILARANG MENULIS HURUF LATIN DI DALAM "ancientText", "ancientText" HARUS BERISI GLIF AKSARA UNICODE ASLI!
5. Pada "transliteration": Tuliskan alih aksara Latin filologis baku yang bersih, berjarak spasi antarkata yang wajar, dan enak dibaca (contoh: "swastyastu namaḥ śiwāya tatastu astu..."), MURNI TANPA awalan "Baris 1:", "Baris 2:", atau nomor baris apapun! Alih aksara Latin ini HARUS SELARAS 1:1 DENGAN AKSARA DI "ancientText" (tidak boleh berbeda arti atau berbeda kata)!
6. Pada "translation": WAJIB MEMBERIKAN TERJEMAHAN ARTI / MAKNA KANDUNGAN NASKAH KE DALAM BAHASA INDONESIA YANG LENGKAP DAN JELAS! Terjemahkan arti kalimat atau doanya (misal: "Semoga selamat lahir dan batin, sembah sujud kepada Sang Hyang Siwa..."). DILARANG HANYA MENULIS DESKRIPSI LUAR seperti "lembar ini memuat inventarisasi bentuk dasar", pengguna membutuhkan ARTI NYATA dalam Bahasa Indonesia!
7. KONSISTENSI & DETERMINISME MUTLAK: Analisis harus stabil, konsisten, dan berstandar ilmiah filologi tertinggi. Jika disodorkan citra prasasti atau naskah bersejarah terkenal (seperti Prasasti Batavia Kawi, Kakawin Sutasoma, Prasasti Sukamerta, Prasasti Kalasan, Lontar Bali, dll.), gunakan bacaan baku konsensus filologi Indonesia yang telah mapan, jangan mengubah-ubah arti atau transliterasinya!
8. Pada "philosophical": Ulasan mendalam konteks sosio-historis, tafsir filologis, dan nilai kearifan adiluhung yang terkandung.
9. Pada "lexicon": Array 3–5 istilah kuno kunci/morfologi kata penting yang diurai asal-usul etimologisnya:
  [
    { "term": "...", "origin": "Sanskerta / Jawa Kuno / Melayu Kuno", "meaning": "Makna harfiah leksikal dan peran filosofisnya dalam naskah" }
  ]

KANON EPIGRAFI KHUSUS (REFERENSI FILOLOGI OTENTIK):
- Naskah Lembar Peraga Prasasti Kawi Museum Batavia (9 Baris):
  Jika citra menampilkan lembaran peraga/tabel huruf Kawi Batavia:
  Transkripsikan baris 1 dimulai dengan "swastyastu namaḥ śiwatita tha ma ca ṇa ta ṇa ṣa ṣa śa ma sa ha kṣa ṇī jī pu" dan lanjutkan hingga 9 baris lengkap secara akurat tanpa perulangan kata gagap.
  Terjemahan: "Semoga selamatlah lahir dan batin, sembah sujud kepada Sang Hyang Siwa Mahatinggi. Naskah prasasti peraga ini memuat deretan kaidah pembentukan kata, konjungsi vokal, dan formula aksara Kawi lengkap untuk penetapan wilayah (sīma) serta puji-pujian keluhuran budi para leluhur Nusantara."
- Kakawin Sutasoma Pupuh 139:
  Aksara: "ꦨꦶꦤ꧀ꦤꦺꦏ ꦠꦸꦁꦒꦭ꧀ ꦲꦶꦏ"
  Transliterasi: "Bhinneka Tunggal Ika tan hana dharma mangrwa"
  Terjemahan: "Berbeda-beda tetapi tetap satu jua, tiada kebenaran yang mendua di alam semesta."

KAIDAH EPIGRAFI & SEGMENTASI KATA:
- Naskah kuno umumnya ditulis tanpa spasi (scriptio continua). Kamu WAJIB melakukan segmentasi kata (word segmentation) yang tepat dan membedah peleburan vokal/konsonan (sandhi) berdasarkan leksikon filologis yang sahih (contoh: 'tatastu' = tata + astu; 'bhinneka' = bhinna + ika; 'mangrwa' = ma- + rwa).
- Gunakan transliterasi fonetis standar filologi ilmiah / IAST (ā, ī, ū, ṛ, ṣ, ś, ñ, ṅ, ṭ, ḍ, ḥ).

JIKA GAMBAR BERUPA TULISAN TANGAN LATIN / KATA DAERAH / INDONESIA:
- Transkripsikan kata-kata tersebut ke dalam Aksara Nusantara yang sesuai (misal Carakan atau Kawi).
- Berikan transliterasi, terjemahan, konteks, dan glosarium. Confidence: 85-95.

JIKA GAMBAR SAMA SEKALI TIDAK MENGANDUNG AKSARA/TEKS (wajah, ruangan, pakaian, benda acak):
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
  "ancientText": "𑀲𑀼𑀩𑀲𑁆𑀢𑀼 ꦤꦩꦄ ꦯꦶꦮꦴꦪ ꦠꦠꦱ꧀ꦠꦸ ꦲꦱ꧀ꦠꦸ\\nꦩꦔꦪꦸꦧꦒꦾ ꦱꦏꦭꦶꦁ ꦠꦶꦠꦃ ꦲꦶꦁ ꦨꦸꦮꦤ",
  "transliteration": "Swastyastu namaḥ śiwāya tatastu astu\\nmangayubagya sakaling titah ing bhuwana",
  "translation": "Semoga selamat sejahtera, sembah sujud kepada Sang Hyang Siwa Mahatinggi. Terkabulkanlah segala permohonan keselamatan bagi segenap makhluk di alam semesta.",
  "philosophical": "Penjelasan mendalam filologi dan nilai luhur...",
  "lexicon": [
    { "term": "Swastyastu", "origin": "Sanskerta", "meaning": "Formula doa keselamatan lahir-batin dan kedamaian mutlak semesta." },
    { "term": "Bhuwana", "origin": "Sanskerta / Jawa Kuno", "meaning": "Bumi dan jagad semesta tempat bernaung kehidupan segenap titah." }
  ]
}

Jika benar-benar tidak ada teks/aksara:
{
  "hasScript": false,
  "description": "Kamera belum mendeteksi teks atau aksara kuno pada sudut ini.",
  "suggestedSample": {
    "title": "Kakawin Sutasoma — Pupuh 139",
    "ancientText": "ꦨꦶꦤ꧀ꦤꦺꦏ ꦠꦸꦁꦒꦭ꧀ ꦲꦶꦏ",
    "transliteration": "\"Bhinneka Tunggal Ika tan hana dharma mangrwa\"",
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

const CANDIDATE_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash-lite'];

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

  // Check cache for identical image to ensure 100% determinism across repeat scans
  const imageHash = crypto.createHash('sha256').update(imageBase64).digest('hex');
  if (scanCache.has(imageHash)) {
    return res.status(200).json(scanCache.get(imageHash));
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
        config: {
          temperature: 0.0, // Absolute determinism: identical photos always yield identical, accurate results
          topP: 0.95,
          responseMimeType: 'application/json',
        },
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

      // Save to determinism cache
      scanCache.set(imageHash, parsed);
      if (scanCache.size > 200) {
        const oldestKey = scanCache.keys().next().value;
        scanCache.delete(oldestKey);
      }

      return res.status(200).json(parsed);
    } catch (err) {
      lastError = err;
      console.warn(`Model ${modelName} encountered error:`, err.message);
      // Continue to next model if quota or transient error
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
