/**
 * server.js — LONTAR-AI Express backend
 * Handles Gemini Vision API calls for Aksara Jawa detection.
 * Serves the built Vite dist/ in production.
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('❌  GEMINI_API_KEY is not set. Add it to your .env file.');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '25mb' }));

// CORS for local dev (Vite on :3000 → server on :3001)
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

  try {
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
    console.error('Gemini API error:', err);
    return res.status(500).json({
      error: err.message || 'Terjadi kesalahan pada Gemini API.',
    });
  }
});

// ── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ── Serve Vite build in production ─────────────────────────────────────────
const distDir = path.join(__dirname, 'dist');
app.use(express.static(distDir));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  LONTAR-AI server running on http://localhost:${PORT}`);
  console.log(`   API: POST http://localhost:${PORT}/api/analyze`);
  console.log(`   Health: GET http://localhost:${PORT}/api/health\n`);
});
