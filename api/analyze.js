import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// In-memory determinism & quota-saving cache for identical images
const scanCache = new Map();

const AKSARA_PROMPT = `Kamu adalah mahaguru, filolog komparatif, dan pakar otoritas tertinggi dalam bidang epigrafi dan paleografi naskah kuno Nusantara dan Asia Tenggara (mencakup seluruh tradisi aksara dan bahasa: Kawi/Jawa Kuno, Jawa/Carakan, Bali, Sunda Kuno & Baku, Batak, Lontara Bugis-Makassar, Surat Ulu/Incung/Rencong/Lampung, Pegon & Jawi, serta Pallawa & Dewanagari Nusantara).

Tugasmu: Menganalisis citra naskah kuno dengan standar filologi akademis tertinggi (merujuk standar filologi internasional dan Nusantara: P.J. Zoetmulder, S.O. Robson, L. Mardiwarsito, J.G. de Casparis, J. Noorduyn, P. Voorhoeve, B.F. Matthes) agar pembacaan aksara, alih aksara (transliterasi), dan terjemahan bahasa Indonesia 100% akurat, lengkap tanpa ada kata yang terlewat, dan bebas dari salah tafsir maupun tertukar bahasa.

================================================================================
PRINSIP 1: IDENTIFIKASI AKSARA & BAHASA YANG TEPAT (DILARANG KERAS TERTUKAR!)
================================================================================
Analisis bentuk visual glif pada gambar secara definitif sebelum menentukan nama bahasa dan tradisi:
1. AKSARA JAWA (Unicode U+A980–U+A9DF):
   - Ciri visual: Lekukan Carakan (ꦲ ꦤ ꦕ ꦫ ꦏ ꦢ ꦠ ꦱ ꦮ ꦭ ...), pasangan di bawah atau di samping.
   - Bahasa: Basa Jawa (Jawa Kuno/Kawi, Jawa Pertengahan, Jawa Anyar).
   - DILARANG menamai naskah sebagai Sunda atau Bali bila tipologi glifnya adalah Carakan Jawa!
2. AKSARA BALI (Unicode U+1B00–U+1B7F):
   - Ciri visual: Lekukan bundar berornamen anggun lembut khas daun lontar Bali (ᬳ ᬦ ᬘ ᬭ ᬓ ...), tanda tedong (ᬵ), ulu, bisah.
   - Bahasa: Kawi Bali, Basa Bali Alus/Lontar.
   - JANGAN TERTUKAR DENGAN AKSARA JAWA!
3. AKSARA SUNDA (Unicode U+1B80–U+1BBF / U+1CC0–U+1CCF):
   - Ciri visual: Sudut kaku, tegas, geometris-piramidal khas Prasasti Kawali dan lontar kabuyutan Sunda (ᮊ ᮌ ᮔ ᮒ ᮕ ᮘ ᮙ ...).
   - Bahasa: Sunda Kuno, Sunda Klasik.
   - DILARANG KERAS MENAMPILKAN AKSARA JAWA ATAU MENULIS BAHASA JAWA JIKA GAMBAR ADALAH AKSARA SUNDA!
4. SURAT BATAK (Unicode U+1BC0–U+1BFF):
   - Ciri visual: Garis horizontal tebal berpatah tajam khas pustaha laklak kulit kayu Sumatera Utara (ᯀ ᯂ ᯔ ᯅ ...).
   - Bahasa: Batak Toba, Karo, Mandailing, Simalungun. JANGAN tertukar dengan aksara lain!
5. AKSARA LONTARA (Unicode U+1A00–U+1A1F):
   - Ciri visual: Bentuk geometris empat penjuru semesta / belah ketupat Sulapa Eppa (ᨀ ᨁ ᨂ ᨄ ...).
   - Bahasa: Basa Ugi (Bugis), Basa Mangkasara (Makassar), Mandar.
6. AKSARA PEGON & JAWI (Unicode U+0600–U+06FF):
   - Ciri visual: Huruf Arab gundul adaptasi Nusantara dengan variasi titik fonem lokal (چ ca, ڠ nga, ڤ pa, ݢ ga, ڽ nya, ۏ va).
   - Bahasa: Melayu Klasik, Jawa Pegon, Sunda Pegon. JANGAN disalahartikan sebagai bahasa Arab Timur Tengah murni!
7. AKSARA KAWI & PALLAWA (Unicode U+11F00–U+11F5F / U+11000–U+1107F):
   - Ciri visual: Bentuk arkais prasasti batu/tembaga era Mataram Kuno (Abad VIII-X), Kadiri, Singhasari, Majapahit.
   - Bahasa: Jawa Kuno (Kawi) atau Sanskerta Nusantara.

BIDANG "language", "language_short", "script_type", "ancientText", dan "transliteration" HARUS 100% SELARAS DAN KONSISTEN!

================================================================================
PRINSIP 2: PENERJEMAHAN UTUH 100% (TIDAK BOLEH ADA KATA ATAU KALIMAT YANG TERLEWAT!)
================================================================================
- DILARANG KERAS MELEWATKAN KATA ATAU KALIMAT:
  Terjemahkan SELURUH naskah dari baris pertama hingga baris terakhir secara lengkap, tuntas, dan mendalam. Dilarang memotong kalimat di tengah jalan, merangkum, atau melewatkan kata maupun bait apapun!
- DILARANG KERAS MENGGUNAKAN TANDA ELIPSIS ("...") ATAU MERINGKAS DI TENGAH:
  JANGAN PERNAH menyisipkan tanda titik-titik "..." atau melompati baris-baris naskah! Transkripsikan setiap kata yang tampak secara utuh.
- DUKUNGAN NASKAH PANJANG & DUA HALAMAN BUKU TERBUKA:
  Jika gambar menampilkan naskah dua halaman terbuka (halaman kanan dan kiri, misalnya hal 29 dan 30), transkripsikan KEDUA HALAMAN secara berurutan dan lengkap (untuk tradisi Arab Melayu/Pegon/Jawi, mulai dari halaman kanan dari atas ke bawah, lalu lanjut ke halaman kiri dari atas ke bawah).
- KORESPONDENSI 1:1:
  Setiap kata pada "ancientText" dan "transliteration" WAJIB memiliki padanan makna yang jelas pada "translation" dalam Bahasa Indonesia yang alami, mengalir, dan berbobot akademis.
- MAKNA MENDALAM (SUBSTANSIAL):
  DILARANG HANYA MENULIS DESKRIPSI META LUAR (seperti "naskah ini memuat tulisan kuno...", "lembaran ini berisi inventarisasi abjad..."). Terjemahkan MAKNA KANDUNGAN ISI NASKAH (apakah itu doa keselamatan, puji-pujian ketuhanan/dewata, ketetapan hukum tanah sima, petuah moral kepahlawanan, atau piagam leluhur)!
- BEBAS DARI LABEL PENOMORAN:
  DILARANG menuliskan label "Baris 1:", "Baris 2:", atau nomor baris apapun ke dalam "transliteration" maupun "translation". Tuliskan teks sastra murni yang berjarak spasi wajar dan nyaman dibaca.

================================================================================
PRINSIP 3: AKURASI KAMUS & KANON FILOLOGI NUSANTARA
================================================================================
Gunakan pembacaan baku konsensus filologis ilmiah yang mapan:
- Naskah Lembar Peraga Prasasti Kawi Museum Batavia (9 Baris):
  * Transliterasi: "swastyastu namaḥ śiwatita tha ma ca ṇa ta ṇa ṣa ṣa śa ma sa ha kṣa ṇī jī pu miktupusyāhārāmācārāmādhūtīdhāyubhāyubhuyusārā rāhimitakṇīśrīputabadisacadarāmamacarablarulāsu viccibvāmātasālyumubdvamāyamadilāmāsā kacyādikādimātināyasitmaruvālidvātapuditakṇubasa śriyudākzkadamahimanasavatāṇīvadikātaksālāmāsāmātīli sīmakīlasupitakavārāṇatuyṇmāyumāyabhavudbhudpu yamālītakamuhnītāsiyāmātasīdgatamasīmīdikamāśu tākasīdgumbīyumātukāgūkādaka"
  * Terjemahan: "Semoga selamatlah lahir dan batin, sembah sujud kehadirat Sang Hyang Siwa Mahatinggi. Naskah prasasti peraga ini memuat deretan kaidah pembentukan kata, konjungsi vokal, dan formula aksara Kawi lengkap untuk penetapan wilayah suci perdikan (sīma) serta puji-pujian keluhuran budi para leluhur Nusantara."
- Kakawin Sutasoma Pupuh 139:
  * Aksara: "ꦨꦶꦤ꧀ꦤꦺꦏ ꦠꦸꦁꦒꦭ꧀ ꦲꦶꦏ"
  * Transliterasi: "Bhinneka Tunggal Ika tan hana dharma mangrwa"
  * Terjemahan: "Berbeda-beda tetapi pada hakikatnya tetap satu jua, tiada kebenaran yang mendua di alam semesta."
- Prasasti Kawali Astana Gede (Sunda Kuno):
  * Aksara: "ᮔᮤᮠᮔ᮪ ᮒᮕᮊ᮪ ᮝᮜᮎ᮪ ᮞᮥᮔ᮪ᮓ"
  * Transliterasi: "Nihan tapak walac sunda"
  * Terjemahan: "Inilah tanda jejak ketetapan dan kejayaan tanah Sunda yang dimuliakan para leluhur."
- Kakawin Arjuna Wiwaha (Bali Lontar):
  * Aksara: "ᬑᬁ ᬅᬯᬶᬖ᭄ᬦᬫᬲ᭄ᬢᬸ ᬦᬫᭀ ᬲᬶᬤ᭄ᬥᬫ᭄"
  * Transliterasi: "Om awighnamastu namo siddham"
  * Terjemahan: "Ya Tuhan Hyang Widhi, semoga tiada rintangan dan tercapailah keberhasilan karya yang luhur ini."
- Pustaha Laklak Batak:
  * Aksara: "ᯅᯉᯪ ᯀᯂᯮ ᯔᯉᯮᯄ᯦᯲ ᯎᯮᯒ᯲ᯑᯰ"
  * Transliterasi: "Bani ahu manuk gurdang sitiktik tano"
  * Terjemahan: "Inilah petuah pusaka suci pelindung bumi pertiwi dan penuntun keselamatan datu."
- Sureq Galigo Bugis (Lontara):
  * Aksara: "ᨕᨗᨐᨊ ᨔᨙᨓ ᨒᨚᨈᨚ ᨄᨈᨘᨑᨗᨐᨚᨒᨚ"
  * Transliterasi: "Iyana sewwa lonto patturioloang"
  * Terjemahan: "Inilah lembaran hikayat leluhur yang menjunjung tinggi martabat, siri' na pacce, dan kebajikan hidup."

JIKA GAMBAR BUKAN AKSARA / TEKS (benda acak, pemandangan, wajah):
- Set hasScript: false, jelaskan secara santun pada "description", dan sertakan "suggestedSample".

Kembalikan respon HANYA dalam format JSON valid (tanpa pembungkus markdown atau komentar di luar JSON):
{
  "hasScript": true,
  "title": "Nama/Judul Naskah atau Prasasti yang Tepat",
  "language": "Nama Aksara & Tradisi Budaya yang Tepat (Contoh: Aksara Sunda Kuno · Tatar Sunda / Aksara Bali · Tradisi Lontar / Aksara Jawa · Carakan / Aksara Batak · Sumatera Utara)",
  "language_short": "Nama Ringkas Aksara (Contoh: Aksara Sunda / Aksara Bali / Aksara Jawa / Surat Batak / Aksara Lontara / Aksara Kawi)",
  "script_type": "Kawi / Jawa / Bali / Sunda / Batak / Lontara / Pegon",
  "period": "Perkiraan Abad/Era (Contoh: Abad XIV Masehi)",
  "origin": "Wilayah Asal Naskah",
  "confidence": 99.2,
  "ancientText": "Aksara Unicode asli yang tepat sesuai gambar...",
  "transliteration": "Alih aksara Latin filologis baku 1:1, bersih dan berjarak spasi...",
  "translation": "Terjemahan lengkap seluruh isi naskah ke Bahasa Indonesia secara utuh tanpa ada kata atau kalimat yang terlewat...",
  "philosophical": "Penjelasan mendalam filologi, latar sosio-historis, dan nilai luhur...",
  "lexicon": [
    { "term": "KataKuno", "origin": "Asal Bahasa", "meaning": "Makna leksikal dan peran filosofisnya" }
  ]
}`;

export const config = {
  maxDuration: 30,
};

const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3-flash-preview',
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

  // Support multiple server API keys separated by commas or multiple envs for automatic failover/rotation
  const rawServerKeys = [
    process.env.GEMINI_API_KEYS,
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_KEY_2,
    process.env.GEMINI_KEY_3,
    process.env.GEMINI_KEY_4,
    process.env.GEMINI_KEY_5,
  ].filter(Boolean).join(',');

  const serverKeyPool = Array.from(new Set(
    rawServerKeys
      .split(/[,;\n\s]+/)
      .map(k => k.trim())
      .filter(k => k.length > 10)
  ));

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      service: 'LONTAR-AI Vision',
      keysInPool: serverKeyPool.length,
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageBase64, mimeType = 'image/jpeg', customApiKey } = req.body || {};
  const userKey = customApiKey?.trim() || req.headers['x-gemini-api-key']?.trim();

  // If user provides personal key, prioritize it first, then fallback to server pool
  const keyCandidates = userKey
    ? [userKey, ...serverKeyPool.filter(k => k !== userKey)]
    : serverKeyPool;

  // Lightweight API key test probe
  if (req.body?.testKeyOnly) {
    const probeKey = userKey || keyCandidates[0];
    if (!probeKey) {
      return res.status(400).json({ valid: false, error: 'Kunci API kosong.' });
    }
    try {
      const probeAi = new GoogleGenAI({ apiKey: probeKey });
      await probeAi.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [{ role: 'user', parts: [{ text: 'p' }] }],
        config: { maxOutputTokens: 2, thinkingConfig: { thinkingBudget: 0 } },
      });
      return res.status(200).json({ valid: true, message: 'Kunci API aktif dan terverifikasi!' });
    } catch (testErr) {
      const msg = testErr.message || '';
      const isQuota = msg.includes('429') || msg.includes('Quota') || msg.includes('RESOURCE_EXHAUSTED');
      const isInvalid = msg.includes('API_KEY_INVALID') || msg.includes('API key not valid') || msg.includes('403');
      return res.status(200).json({
        valid: false,
        error: isQuota
          ? 'Kunci valid tetapi kuota habis (429).'
          : isInvalid
          ? 'Kunci tidak valid / ditolak oleh Google AI Studio.'
          : `Gagal verifikasi: ${msg.slice(0, 120)}`,
      });
    }
  }

  if (keyCandidates.length === 0) {
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

  // Try each API key in the pool (automatic failover if one key is quota-exhausted)
  for (let keyIdx = 0; keyIdx < keyCandidates.length; keyIdx++) {
    const activeApiKey = keyCandidates[keyIdx];
    const ai = new GoogleGenAI({ apiKey: activeApiKey });
    let keyHitQuota = false;

    // Try candidate models in order with a strict per-model timeout
    for (const modelName of CANDIDATE_MODELS) {
      const modelController = new AbortController();
      const modelTimeout = setTimeout(() => {
        try {
          modelController.abort();
        } catch (_) {}
      }, 5500);

      try {
        const configObj = {
          temperature: 0.0, // Absolute determinism: identical photos always yield identical, accurate results
          topP: 0.95,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
          abortSignal: modelController.signal,
          // Disable reasoning/thinking token budgets to ensure near-instant (1-2s) vision response
          thinkingConfig: { thinkingBudget: 0 },
        };

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
          console.warn(`Model ${modelName} hit quota for Key #${keyIdx + 1}, trying alternative model...`);
          continue; // Try next candidate model for this key before abandoning
        }
        console.warn(`Model ${modelName} encountered error:`, err.message);
      }
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
