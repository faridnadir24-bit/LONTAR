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
  console.error('❌  GEMINI_API_KEY is not set. Add it to your .env file.');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

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

  const CANDIDATE_MODELS = ['gemini-3.5-flash', 'gemini-3.5-flash-lite'];
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
