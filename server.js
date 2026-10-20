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
