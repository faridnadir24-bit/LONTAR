/**
 * server.js — LONTAR-AI Express backend
 * Handles Gemini Vision API calls for Aksara Jawa detection.
 * Serves the built Vite dist/ in production.
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.warn('⚠️ GEMINI_API_KEY is not set in .env.');
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY || '' });

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '25mb' }));

// CORS for local dev
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    process.env.APP_URL,
  ].filter(Boolean);

  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ── Gemini prompt ───────────────────────────────────────────────────────────
const AKSARA_PROMPT = `Kamu adalah mahaguru dan pakar otoritas tertinggi dalam bidang epigrafi, paleografi, dan filologi naskah kuno Nusantara dan Asia Tenggara (mencakup Aksara Kawi/Jawa Kuno, Aksara Jawa/Hanacaraka/Carakan, Aksara Bali, Aksara Sunda Kuno & Sunda Baku, Aksara Batak Toba/Karo/Mandailing, Aksara Lontara/Bugis/Makassar, Aksara Rencong/Surat Ulu/Incung/Ka-Ga-Nga, Aksara Lampung/Had Lampung, Aksara Pegon & Jawi/Arab Melayu, Aksara Pallawa & Dewanagari/Sanskerta Nusantara, prasasti batu/tembaga, serta lembar lontar).

Tugasmu: Menganalisis citra naskah kuno dengan standar akademis filologi tertinggi (merujuk standar P.J. Zoetmulder, S.O. Robson, L. Mardiwarsito, J.G. de Casparis) agar pembacaan, alih aksara (transliterasi), dan terjemahan akurat 100%, bebas kesalahan tafsir atau halusinasi.

ATURAN FORMAT PENULISAN TEKS (SANGAT KRUSIAL - BACA TELITI):
1. DILARANG KERAS MENULISKAN LABEL PENOMORAN SEPERTI "baris 1", "baris 2", "Baris 1:", "Baris 2:", "baris 3", ATAU SEJENISNYA! Pengguna sangat bingung jika melihat kata "baris 1", "baris 2", dll.
2. DILARANG MENULISKAN KOMENTAR META SEPERTI "(tampak tertera pada naskah daun lontar/daluang)" ke dalam teks aksara! Teks harus murni berisi kata-kata naskah asli.
3. Pada "ancientText": Tuliskan HANYA karakter aksara Unicode asli murni (misal aksara Kawi, Jawa, Bali, Sunda, Batak, Lontara, Pegon) yang terbaca secara berurutan dan mengalir alami. Jika naskah terdiri dari beberapa baris fisik, pisahkan langsung dengan baris baru (\\n) TANPA awalan kata "baris".
4. Pada "transliteration": Tuliskan alih aksara Latin filologis yang bersih, utuh, dan mengalir alami (seperti membaca prosa atau bait tembang/puisi), MURNI TANPA awalan "Baris 1:", "Baris 2:", atau nomor baris apapun!
5. Pada "translation": Terjemahkan makna seluruh naskah secara utuh ke dalam Bahasa Indonesia yang kaya sastra dan mengalir alami, TANPA penomoran baris.
6. Pada "philosophical": Ulasan mendalam konteks sosio-historis, tafsir filologis, dan nilai kearifan adiluhung yang terkandung.
7. Pada "lexicon": Array 3–5 istilah kuno kunci/morfologi kata penting yang diurai asal-usul etimologisnya:
  [
    { "term": "...", "origin": "Sanskerta / Jawa Kuno / Melayu Kuno", "meaning": "Makna harfiah leksikal dan peran filosofisnya dalam naskah" }
  ]

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

// ── POST /api/analyze ───────────────────────────────────────────────────────
app.post('/api/analyze', async (req, res) => {
  const { imageBase64, mimeType = 'image/jpeg' } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'imageBase64 diperlukan.' });
  }

  // Validate base64 length (roughly < 20 MB)
  if (imageBase64.length > 28_000_000) {
    return res.status(413).json({ error: 'Gambar terlalu besar. Maksimum ~20 MB.' });
  }

  const CANDIDATE_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.5-flash'];
  let lastError = null;

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

      // Strip any accidental markdown fences
      let cleaned = rawText
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      // If still surrounded by text, extract the first JSON object
      if (!cleaned.startsWith('{')) {
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) cleaned = match[0];
      }

      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch (parseErr) {
        console.error('JSON parse error. Raw text:', rawText);
        return res.status(500).json({
          error: 'Respons AI tidak valid. Coba lagi.',
          raw: rawText,
        });
      }

      return res.json(parsed);
    } catch (err) {
      lastError = err;
      console.warn(`Local model ${modelName} encountered error:`, err.message);
      const isQuota = err.message && (err.message.includes('429') || err.message.includes('Quota exceeded') || err.message.includes('RESOURCE_EXHAUSTED'));
      if (!isQuota) break;
    }
  }

  const errMsg = lastError?.message || '';
  const isQuota = errMsg.includes('429') || errMsg.includes('Quota exceeded') || errMsg.includes('RESOURCE_EXHAUSTED');
  if (isQuota) {
    return res.status(429).json({
      errorType: 'QUOTA_EXCEEDED',
      error: 'Batas kuota harian Gemini API (Free Tier) telah tercapai pada akun Google ini. Kuota akan direset otomatis oleh Google.',
    });
  }

  return res.status(500).json({
    errorType: 'UNKNOWN_ERROR',
    error: lastError?.message || 'Terjadi kesalahan pada Gemini API.',
  });
});

// ── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ── Serve frontend ────────────────────────────────────────────────────────
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir) && fs.existsSync(path.join(distDir, 'index.html'))) {
  app.use(express.static(distDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
} else {
  app.use(express.static(__dirname));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
}

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  LONTAR-AI server running on http://localhost:${PORT}`);
  console.log(`   API: POST http://localhost:${PORT}/api/analyze`);
  console.log(`   Health: GET http://localhost:${PORT}/api/health\n`);
});
