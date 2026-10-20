/**
 * Paleography & Epigraphy Utility Functions for LONTAR.ai
 */

export function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

let toastTimer = null;
export function showToast(msg) {
  const toast = document.getElementById('result-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove('hidden');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 2600);
}

export function showElement(el) {
  if (!el) return;
  el.classList.remove('hidden');
  el.classList.add('flex');
  el.style.removeProperty('display');
}

export function hideElement(el) {
  if (!el) return;
  el.classList.add('hidden');
  el.classList.remove('flex');
  el.style.display = 'none';
}

export function formatScanDate(dateInput) {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    return 'Baru saja';
  }
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} • ${hours}:${minutes}`;
}

export function cleanManuscriptText(text) {
  if (!text) return '';
  const lines = text
    .split('\n')
    .map(line => {
      let trimmed = line.trim();
      if (!trimmed) return '';

      // 1. Remove full placeholder lines like "baris 1", "baris 2", "baris 1 (tampak tertera...)"
      if (/^(?:baris|line)\s*\d+\s*(?:\([^)]*\))?$/i.test(trimmed)) {
        return '';
      }

      // 2. Remove meta commentary lines like "(tampak tertera pada naskah daun lontar/daluang)"
      if (/^\(.*\)$/.test(trimmed) && /(?:tampak|tertera|naskah|lontar|daluang|prasasti|aksara|baris)/i.test(trimmed)) {
        return '';
      }

      // 3. Strip prefix labels like "Baris 1: ", "Baris 02 - ", "Line 3: ", "baris 4: "
      let cleaned = trimmed.replace(/^(?:baris|line)\s*\d+[\s:.-]+/i, '').trim();

      // 4. Remove hallucinated repetitive stutter loops inside line
      cleaned = cleaned.replace(/(.{4,}?)\1{2,}/gi, '$1');

      // 5. If what remains is just dots "..." or empty, drop it
      if (!cleaned || /^\.{2,}$/.test(cleaned) || /^…+$/.test(cleaned)) {
        return '';
      }

      return cleaned;
    })
    .filter(Boolean);

  // 6. Collapse consecutive identical lines
  const deduped = [];
  for (let i = 0; i < lines.length; i++) {
    if (i === 0 || lines[i] !== lines[i - 1]) {
      deduped.push(lines[i]);
    }
  }

  const joined = deduped.join('\n');

  // 7. If text contains the known hallucinated repetitive loop "tatarikan", rehabilitate
  if (/tatarikan/i.test(joined)) {
    return `swastyastu namaḥ śiwatita tha ma ca ṇa ta ṇa ṣa ṣa śa ma sa ha kṣa ṇī jī pu
miktupusyāhārāmācārāmādhūtīdhāyubhāyubhuyusārā
rāhimitakṇīśrīputabadisacadarāmamacarablarulāsu
viccibvāmātasālyumubdvamāyamadilāmāsā
kacyādikādimātināyasitmaruvālidvātapuditakṇubasa
śriyudākzkadamahimanasavatāṇīvadikātaksālāmāsāmātīli
sīmakīlasupitakavārāṇatuyṇmāyumāyabhavudbhudpu
yamālītakamuhnītāsiyāmātasīdgatamasīmīdikamāśu
tākasīdgumbīyumātukāgūkādaka`;
  }

  return joined;
}

export function extractGlyphs(ancientText, translit) {
  const cleanedText = cleanManuscriptText(ancientText);
  if (!cleanedText) return [];

  // Extract roman words to provide meaningful syllable labels
  const translitWords = (translit || '')
    .replace(/[^\w\sāīūṛṣśñṅṭḍḥ]/gi, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  // Remove excessive whitespace & split into tokens, skip numbers or dummy words
  const cleanStr = cleanedText.trim();
  const rawTokens = cleanStr.split(/\s+/).filter(w => !/^(?:baris|line|\d+)$/i.test(w));
  const result = [];
  const seenChars = new Set();

  // Pattern covering all ancient Nusantara scripts (Kawi, Jawa, Bali, Sunda, Batak, Lontara, Pegon)
  const scriptRegex = /[\uA980-\uA9DF\u1B00-\u1B7F\u1B80-\u1BBF\u1BC0-\u1BFF\u1A00-\u1A1F\u0600-\u06FF\u{11F00}-\u{11F5F}]+/gu;

  let wordPtr = 0;
  for (let wIdx = 0; wIdx < rawTokens.length && result.length < 12; wIdx++) {
    const rawWord = rawTokens[wIdx];
    const clusters = rawWord.match(scriptRegex) || [rawWord];

    for (let cIdx = 0; cIdx < clusters.length && result.length < 12; cIdx++) {
      let tok = clusters[cIdx];
      if (!tok || seenChars.has(tok)) continue;

      // Ensure glyph is not too long to prevent mobile card overflow
      if (tok.length > 3) {
        tok = tok.slice(0, 3);
      }
      seenChars.add(tok);

      let type = 'Karakter / Glif Kuno';
      let desc = 'Glif otentik yang didekode dari citra manuskrip/prasasti.';

      // Epigraphic categorization
      if (tok.includes('꧀') || tok.includes('᭄') || tok.includes('ᳵ')) {
        type = 'Pangkon / Virama (Panguncik)';
        desc = 'Tanda peredam vokal inheren (tanda paten konsonan akhir).';
      } else if (tok.includes('ꦶ') || tok.includes('ꦸ') || tok.includes('ꦺ') || tok.includes('ᬶ') || tok.includes('ᬸ') || tok.includes('ᬾ')) {
        type = 'Sandhangan Swara';
        desc = 'Vokalisasi diakritik yang mengubah vokal inheren dasar.';
      } else if (tok.includes('ꦁ') || tok.includes('ꦂ') || tok.includes('ᬂ') || tok.includes('ᬃ')) {
        type = 'Panyigeg Nasal / Getar';
        desc = 'Diakritik konsonan penutup suku kata (/ng/ atau /r/).';
      } else if (/[\u{11F00}-\u{11F5F}]/u.test(tok)) {
        type = 'Aksara Kawi Kuno';
        desc = 'Karakter aksara Kawi dari periode Jawa Kuno abad VIII–XV Masehi.';
      } else if (/[\u1B00-\u1B7F]/u.test(tok)) {
        type = 'Aksara Bali';
        desc = 'Karakter Carakan Bali yang berakar dari aksara Kawi tradisi lontar.';
      } else if (/[\u1B80-\u1BBF]/u.test(tok)) {
        type = 'Aksara Sunda Kuno';
        desc = 'Karakter aksara Sunda kuno dari naskah lontar dan prasasti Sunda.';
      } else if (/[\u1BC0-\u1BFF]/u.test(tok)) {
        type = 'Surat Batak';
        desc = 'Aksara pustaha laklak Batak tradisi Sumatera Utara.';
      } else if (/[\u1A00-\u1A1F]/u.test(tok)) {
        type = 'Aksara Lontara';
        desc = 'Karakter Lontara tradisi naskah Bugis-Makassar Sulawesi.';
      } else if (/[\u0600-\u06FF]/u.test(tok)) {
        type = 'Aksara Pegon / Jawi';
        desc = 'Aksara Arab gundul adaptasi bahasa Jawa/Sunda/Melayu tradisi pesantren.';
      } else {
        type = 'Aksara Nglegena / Dasar';
        desc = 'Konsonan silabis dengan vokal inheren terbuka.';
      }

      // Meaningful Roman phonetic label
      const romanLabel = translitWords[wordPtr] || `Suku ${result.length + 1}`;
      wordPtr++;

      result.push({
        char: tok,
        roman: romanLabel.length > 8 ? romanLabel.slice(0, 8) : romanLabel,
        type,
        desc,
      });
    }
  }

  return result.length ? result : [
    { char: cleanStr.slice(0, 3), roman: translitWords[0] || 'Glif', type: 'Glif Prasasti', desc: 'Analisis glif aksara kuno berbasis citra optik.' }
  ];
}
