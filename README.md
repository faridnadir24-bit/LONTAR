# 📜 LONTAR-AI — Ancient Manuscript Scanner & Translator

> **Jembatan Bahasa Kuno ke Modern**  
> Mobile-first web app prototype that scans, transcribes, and translates ancient Indonesian manuscripts (lontar) into modern Indonesian using AI vision and leksikon models.

---

## ✨ Features

- **🏛️ Cultural Heritage Preservation**: Digitizes and transcribes historical Indonesian palm leaf manuscripts (*lontar* / *ron tal*).
- **📷 Interactive Camera Viewfinder**: Simulated optical scanner with animated glowing gold laser reticle and real-time bounding box detection.
- **📜 Split-Screen Analysis**:
  - **Teks Kuno (Aksara Jawa)**: Renders classical Javanese unicode script (`ꦱꦶꦤꦸꦮꦸꦤ꧀ ꦱꦸꦫꦪ ꦧꦸꦩꦶ`) with Latin transliteration and provenance metadata.
  - **Terjemahan (Bahasa Indonesia)**: Modern Indonesian translation with philosophical context notes.
- **🔊 Voice Synthesis (Web Speech API)**: Speaks the Indonesian translation aloud (`id-ID`) with synchronized soundwave animations.
- **📚 Local History Archive**: Saves scans to `localStorage` with search, filter, and quick recall capabilities.
- **🌙 Dark & Light Themes**: Inspired by ancient gold (`#D4AF37`), dark wood brown (`#4A3728`), and soft parchment cream (`#FDF6E3`).
- **📱 Mobile-First Responsive Design**: Optimized for mobile devices and presented in an exhibition kiosk frame on desktop screens.

---

## 🛠️ Tech Stack

- **HTML5 & Vanilla JavaScript**: Fast, single-file prototype (`index.html`) without heavyweight framework overhead.
- **Tailwind CSS (CDN)**: Modern utility classes with custom theme extensions and dark mode.
- **Google Fonts**: *Playfair Display* (Serif), *Inter* (Sans-serif), and *Noto Sans Javanese*.
- **Web Speech API**: In-browser speech synthesis for Indonesian audio playback.
- **Vite & TypeScript**: Local dev environment and unit testing utilities.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)

### Installation & Run

1. Clone repository:
   ```bash
   git clone https://github.com/faridnadir24-bit/LONTAR.git
   cd LONTAR
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Or simply open `index.html` directly in any modern web browser!

---

## 🧪 Unit Tests

Run the logic test suite using Node's native test runner:
```bash
node --test src/utils/lontarLogic.test.ts
```

---

## 📄 License
Apache-2.0
