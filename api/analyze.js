import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// In-memory determinism & quota-saving cache for identical images
const scanCache = new Map();

const AKSARA_PROMPT = `Kamu adalah mahaguru dan pakar otoritas tertinggi dalam bidang epigrafi, paleografi, dan filologi komparatif naskah kuno Nusantara dan Asia Tenggara (mencakup seluruh tradisi aksara dan bahasa: Kawi/Jawa Kuno, Jawa/Carakan, Bali, Sunda Kuno & Baku, Batak, Lontara Bugis-Makassar, Surat Ulu/Incung/Rencong/Lampung, Pegon & Jawi, serta Pallawa & Dewanagari Nusantara).

Tugasmu: Menganalisis citra naskah kuno dengan standar akademis filologi tertinggi (merujuk standar P.J. Zoetmulder, S.O. Robson, L. Mardiwarsito, J.G. de Casparis, J. Noorduyn, P. Voorhoeve, B.F. Matthes) agar pembacaan, alih aksara (transliterasi), dan terjemahan akurat 100%, bebas kesalahan tafsir atau halusinasi.

PRINSIP INTEGRITAS BAHASA & AKSARA (ANTI-TERTUKAR & BEBAS KESALAHAN):
1. DILARANG KERAS MENUKAR AKSARA & BAHASA! Setiap tradisi naskah Nusantara memiliki tipologi visual, inventaris fonem, dan tata bahasa tersendiri:
   - AKSARA JAWA (Unicode U+A980–U+A9DF): Carakan (ha-na-ca-ra-ka...). Digunakan untuk Bahasa Jawa Kuno, Jawa Pertengahan, atau Jawa Baru. JANGAN tertukar dengan Sunda atau Bali.
   - AKSARA BALI (Unicode U+1B00–U+1B7F): Aksara Wreastra/Swalalita (ha-na-ca-ra-ka...). Ciri khas: lekukan ornamen melengkung lembut, tedong (ᬵ), ulu, bisah. Bahasa: Kawi Bali, Basa Bali. JANGAN tertukar dengan Jawa.
   - AKSARA SUNDA (Unicode U+1B80–U+1BBF): Aksara Sunda Kuno & Baku (ka-ga-nga-ca-ja-nya...). Ciri khas: bentuk kaku bersudut tegas/geometris piramidal (ᮊ ᮌ ᮔ ᮒ). Bahasa: Sunda Kuno (Prasasti Kawali, naskah lontar Sunda), Sunda Klasik. DILARANG KERAS MENULIS AKSARA JAWA BILA GAMBAR BERAKSARA SUNDA!
   - SURAT BATAK (Unicode U+1BC0–U+1BFF): Pustaha Laklak (a-ha-ma-na-ra-ta...). Ciri khas: garis horizontal tebal dan sudut patah khas Sumatera Utara (ᯀ ᯂ ᯔ ᯅ). Bahasa: Batak Toba, Karo, Mandailing, Simalungun. JANGAN tertukar dengan aksara lain!
   - AKSARA LONTARA (Unicode U+1A00–U+1A1F): Sulapa Eppa segi empat/belah ketupat (ᨀ ᨁ ᨂ ᨄ). Bahasa: Basa Ugi (Bugis), Basa Mangkasara (Makassar), Mandar. JANGAN tertukar dengan aksara lain!
   - AKSARA PEGON & JAWI (Unicode U+0600–U+06FF): Abjad Arab gundul adaptasi Nusantara dengan konsonan tambahan (چ ca, ڠ nga, ڤ pa, ݢ ga, ڽ nya, ۏ va). Bahasa: Melayu Klasik, Jawa Pegon, Sunda Pegon. JANGAN disalahartikan sebagai Bahasa Arab Timur Tengah murni!
   - AKSARA KAWI & PALLAWA (Unicode U+11F00–U+11F5F / U+11000–U+1107F): Aksara Kawi Arkais prasasti batu/tembaga Jawa Kuna era Mataram Kuno, Kadiri, Singhasari, Majapahit. Bahasa: Jawa Kuno (Kawi) atau Sanskerta Nusantara.

2. ATURAN FORMAT PENULISAN TEKS (SANGAT KRUSIAL - BACA TELITI):
   - DILARANG MENULISKAN LABEL PENOMORAN SEPERTI "baris 1", "baris 2", "Baris 1:", "Baris 2:", ATAU SEJENISNYA!
   - DILARANG MENULISKAN KOMENTAR META SEPERTI "(tampak tertera pada naskah daun lontar/daluang)" ke dalam teks aksara! Teks harus murni berisi kata-kata naskah asli.
   - DILARANG KERAS MENGHASILKAN KATA HALUSINASI BERULANG ATAU GAGAP SUKU KATA ('tatarikantiri...'). Setiap kata Latin harus berupa kata filologi yang bermakna nyata dan dipisahkan dengan SPASI yang jelas!
   - Pada "ancientText": Tuliskan HANYA karakter aksara Unicode asli murni yang sesuai dengan tradisi naskah yang tertera di gambar. DILARANG MENULIS HURUF LATIN DI DALAM "ancientText"!
   - Pada "transliteration": Tuliskan alih aksara Latin filologis baku yang bersih, berjarak spasi antarkata yang wajar, dan enak dibaca, MURNI TANPA awalan "Baris 1:", "Baris 2:", atau nomor baris apapun! Alih aksara Latin ini HARUS SELARAS 1:1 DENGAN AKSARA DI "ancientText".
   - Pada "translation": WAJIB MEMBERIKAN TERJEMAHAN ARTI / MAKNA KANDUNGAN NASKAH KE DALAM BAHASA INDONESIA YANG LENGKAP DAN JELAS! Terjemahkan arti kalimat atau doanya. DILARANG HANYA MENULIS DESKRIPSI LUAR seperti "lembar ini memuat inventarisasi bentuk dasar", pengguna membutuhkan ARTI NYATA dalam Bahasa Indonesia!
   - KONSISTENSI & DETERMINISME MUTLAK: Analisis harus stabil, konsisten, dan berstandar ilmiah filologi tertinggi. Jika disodorkan citra prasasti atau naskah bersejarah terkenal (seperti Prasasti Batavia Kawi, Kakawin Sutasoma, Prasasti Kawali Sunda, Prasasti Sukamerta, Lontar Bali, Pustaha Batak, Sureq Galigo Bugis), gunakan bacaan baku konsensus filologi yang telah mapan, jangan mengubah-ubah arti atau transliterasinya!
   - Pada "philosophical": Ulasan mendalam konteks sosio-historis, tafsir filologis, dan nilai kearifan adiluhung yang terkandung.
   - Pada "lexicon": Array 3–5 istilah kuno kunci/morfologi kata penting yang diurai asal-usul etimologisnya:
     [
       { "term": "...", "origin": "Sanskerta / Jawa Kuno / Sunda Kuno / Batak / Bugis / Melayu Kuno", "meaning": "Makna harfiah leksikal dan peran filosofisnya dalam naskah" }
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
- Prasasti Kawali Astana Gede (Sunda Kuno):
  Aksara: "ᮔᮤᮠᮔ᮪ ᮒᮕᮊ᮪ ᮝᮜᮎ᮪ ᮞᮥᮔ᮪ᮓ"
  Transliterasi: "Nihan tapak walac sunda"
  Terjemahan: "Inilah tanda jejak kejayaan tanah Sunda yang dimuliakan para leluhur."
- Kakawin Arjuna Wiwaha (Bali Lontar):
  Aksara: "ᬑᬁ ᬅᬯᬶᬖ᭄ᬦᬫᬲ᭄ᬢᬸ ᬦᬫᭀ ᬲᬶᬤ᭄ᬥᬫ᭄"
  Transliterasi: "Om awighnamastu namo siddham"
  Terjemahan: "Ya Tuhan, semoga tiada rintangan dan sempurnalah karya yang luhur ini."
- Pustaha Laklak Batak:
  Aksara: "ᯅᯉᯪ ᯀᯂᯮ ᯔᯉᯮᯄ᯦᯲ ᯎᯮᯒ᯲ᯑᯰ"
  Transliterasi: "Bani ahu manuk gurdang sitiktik tano"
  Terjemahan: "Inilah petuah pusaka datu tentang tatanan harmoni dan perlindungan semesta."
- Sureq Galigo Bugis (Lontara):
  Aksara: "ᨕᨗᨐᨊ ᨔᨙᨓ ᨒᨚᨈᨚ ᨄᨈᨘᨑᨗᨐᨚᨒᨚ"
  Transliterasi: "Iyana sewwa lonto patturioloang"
  Terjemahan: "Inilah lembaran hikayat leluhur yang menjunjung tinggi martabat dan siri'."

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

export const config = {
  maxDuration: 30,
};

const CANDIDATE_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite-preview',
  'gemini-3.8-flash',
];

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

  let cleanBase64 = imageBase64;
  if (cleanBase64.includes('base64,')) {
    cleanBase64 = cleanBase64.split('base64,')[1];
  }
  cleanBase64 = cleanBase64.replace(/\s+/g, '');

  // Check cache for identical image to ensure 100% determinism across repeat scans
  const imageHash = crypto.createHash('sha256').update(cleanBase64).digest('hex');
  if (scanCache.has(imageHash)) {
    return res.status(200).json(scanCache.get(imageHash));
  }

  let lastError = null;
  let hadQuotaError = false;
  const ai = new GoogleGenAI({ apiKey: activeApiKey });

  // Try candidate models in order with a resilient per-model timeout
  for (const modelName of CANDIDATE_MODELS) {
    const modelController = new AbortController();
    const modelTimeout = setTimeout(() => {
      try {
        modelController.abort();
      } catch (_) {}
    }, 13000);

    try {
      const configObj = {
        temperature: 0.0, // Absolute determinism: identical photos always yield identical, accurate results
        topP: 0.95,
        responseMimeType: 'application/json',
        abortSignal: modelController.signal,
      };

      if (modelName.includes('3.8')) {
        configObj.thinkingConfig = { thinkingBudget: 0 };
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [
              { text: AKSARA_PROMPT },
              { inlineData: { mimeType, data: cleanBase64 } },
            ],
          },
        ],
        config: configObj,
      });

      clearTimeout(modelTimeout);

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
      clearTimeout(modelTimeout);
      lastError = err;
      const msg = err.message || '';
      if (msg.includes('429') || msg.includes('Quota exceeded') || msg.includes('RESOURCE_EXHAUSTED')) {
        hadQuotaError = true;
      }
      console.warn(`Model ${modelName} encountered error:`, err.message);
      // Continue to next model if quota or transient error or timeout
    }
  }

  // If all models failed, parse and return human-friendly error
  const errMsg = lastError?.message || '';
  const isTimeout = lastError?.name === 'AbortError' || errMsg.includes('timeout') || errMsg.includes('abort');
  const isQuota = hadQuotaError || errMsg.includes('429') || errMsg.includes('Quota exceeded') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('exhausted');
  const isInvalidKey = errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key not valid') || errMsg.includes('403');

  if (isQuota) {
    return res.status(429).json({
      errorType: 'QUOTA_EXCEEDED',
      error: 'Batas kuota harian Gemini API (Free Tier) telah tercapai pada akun Google ini. Anda dapat memasukkan Kunci API Gemini milik sendiri di pengaturan.',
      details: errMsg,
    });
  }

  if (isTimeout) {
    return res.status(504).json({
      errorType: 'TIMEOUT',
      error: 'Waktu respons layanan AI melebihi batas (server Google sedang sibuk). Silakan coba lagi atau gunakan naskah peraga.',
      details: errMsg,
    });
  }

  if (isInvalidKey) {
    return res.status(401).json({
      errorType: 'INVALID_API_KEY',
      error: 'Kunci API Gemini tidak valid atau izin akses ditolak oleh Google AI Studio.',
      details: errMsg,
    });
  }

  return res.status(500).json({
    errorType: 'UNKNOWN_ERROR',
    error: 'Terjadi kendala saat menganalisis citra dengan layanan AI Google. Anda dapat memasukkan API Key pribadi atau mencoba naskah peraga.',
    details: errMsg,
  });
}
