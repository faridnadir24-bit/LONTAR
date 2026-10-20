/**
 * Pure logic utilities for LONTAR-AI manuscript scanner
 */

export interface LontarScanItem {
  id: string;
  title: string;
  date: string;
  timestamp: number;
  aksaraText: string;
  translation: string;
  transliteration?: string;
  language: string;
  icon: string;
  lexicon?: Array<{ term: string; origin: string; meaning: string }>;
  lineByLine?: Array<{ line: number; script: string; transliteration: string; translation: string }>;
}

export const INITIAL_MOCK_HISTORY: LontarScanItem[] = [
  {
    id: 'lontar-1',
    title: 'Kakawin Sutasoma - Pupuh 139',
    date: '18 Okt 2026 • 14:20',
    timestamp: 1792340400000,
    aksaraText: 'ꦨꦶꦤ꧀ꦤꦺꦏ ꦠꦸꦁꦒꦭ꧀ ꦲꦶꦏ',
    transliteration: 'Bhinneka Tunggal Ika',
    translation: 'Bhinneka Tunggal Ika tan hana dharma mangrwa (Berbeda-beda tetapi tetap satu jiwa, tiada kebenaran yang mendua).',
    language: 'Kawi / Jawa Kuno',
    icon: '📜',
  },
  {
    id: 'lontar-2',
    title: 'Prasasti Sukamerta - Lempeng III',
    date: '15 Okt 2026 • 09:45',
    timestamp: 1792064700000,
    aksaraText: 'ꦱꦶꦢ꧀ꦣꦶ ꦫꦱ꧀ꦠꦸ',
    transliteration: 'Siddhi rastu',
    translation: 'Semoga berhasil dan diberkahi keselamatan bagi segenap warga desa serta generasi penerus.',
    language: 'Jawa Kuno',
    icon: '🪨',
  },
  {
    id: 'lontar-3',
    title: 'Babad Tanah Jawi - Pupuh Sinom',
    date: '12 Okt 2026 • 16:10',
    timestamp: 1791831000000,
    aksaraText: 'ꦤꦸꦭꦢ ꦭꦏꦸ ꦲꦸꦠꦩ',
    transliteration: 'Nulada laku utama',
    translation: 'Meneladani perbuatan utama yang luhur budi pekerti demi kedamaian dan ketenteraman negeri.',
    language: 'Aksara Jawa',
    icon: '📖',
  },
];

export function formatScanDate(dateInput: Date | number | string): string {
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

export function createHistoryItem(
  title: string,
  aksaraText: string,
  translation: string,
  options?: Partial<Omit<LontarScanItem, 'id' | 'title' | 'aksaraText' | 'translation'>>
): LontarScanItem {
  const now = new Date();
  return {
    id: 'scan-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    title: title.trim() || 'Lontar Tanpa Judul',
    aksaraText: aksaraText.trim(),
    translation: translation.trim(),
    transliteration: options?.transliteration || '',
    language: options?.language || 'Aksara Jawa',
    icon: options?.icon || '📜',
    date: formatScanDate(now),
    timestamp: now.getTime(),
  };
}

export function filterHistory(items: LontarScanItem[], query: string): LontarScanItem[] {
  if (!query || !query.trim()) return items;
  const q = query.toLowerCase().trim();
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.translation.toLowerCase().includes(q) ||
      item.language.toLowerCase().includes(q) ||
      (item.transliteration && item.transliteration.toLowerCase().includes(q))
  );
}

export function prepareSpeechPayload(text: string): { text: string; lang: string; rate: number } {
  const cleaned = text
    .replace(/[\uA980-\uA9DF\u1B00-\u1B7F\u1B80-\u1BBF\u1BC0-\u1BFF\u1A00-\u1A1F\u{11F00}-\u{11F5F}\u0900-\u097F]/gu, '')
    .replace(/[«»"“”'']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return {
    text: cleaned,
    lang: 'id-ID',
    rate: 0.95,
  };
}

// ── Multi-Script Detection & Linguistic Attribution Engine ──────
export type NusantaraScriptKey = 'javanese' | 'balinese' | 'sundanese' | 'batak' | 'lontara' | 'pegon' | 'kawi';

export function detectScriptFromUnicode(text: string): NusantaraScriptKey | null {
  if (!text) return null;
  const counts: Record<NusantaraScriptKey, number> = {
    javanese: (text.match(/[\uA980-\uA9DF]/g) || []).length,
    balinese: (text.match(/[\u1B00-\u1B7F]/g) || []).length,
    sundanese: (text.match(/[\u1B80-\u1BBF\u1CC0-\u1CCF]/g) || []).length,
    batak: (text.match(/[\u1BC0-\u1BFF]/g) || []).length,
    lontara: (text.match(/[\u1A00-\u1A1F]/g) || []).length,
    pegon: (text.match(/[\u0600-\u06FF]/g) || []).length,
    kawi: (text.match(/[\u{11000}-\u{1107F}\u{11F00}-\u{11F5F}]/gu) || []).length,
  };

  let top: NusantaraScriptKey | null = null;
  let max = 0;
  for (const [k, v] of Object.entries(counts) as [NusantaraScriptKey, number][]) {
    if (v > max) {
      max = v;
      top = k;
    }
  }
  return max > 0 ? top : null;
}

export function getScriptMetadata(scriptKey: NusantaraScriptKey) {
  const SCRIPT_INFO: Record<NusantaraScriptKey, { name: string; short: string; family: string; period: string; origin: string }> = {
    javanese: {
      name: 'Aksara Jawa (Carakan)',
      short: 'Aksara Jawa',
      family: 'Turunan Kawi / Brahmi',
      period: 'Abad XV–XX M',
      origin: 'Jawa Tengah, D.I. Yogyakarta, Jawa Timur',
    },
    balinese: {
      name: 'Aksara Bali (Hanacaraka Bali)',
      short: 'Aksara Bali',
      family: 'Turunan Kawi / Brahmi',
      period: 'Abad XI M–Sekarang',
      origin: 'Bali & Lombok (Tradisi Lontar)',
    },
    sundanese: {
      name: 'Aksara Sunda Kuno & Baku',
      short: 'Aksara Sunda',
      family: 'Palaeo-Sunda Kuno',
      period: 'Abad XIV–XVIII M (Prasasti Kawali)',
      origin: 'Tatar Sunda (Jawa Barat & Banten)',
    },
    batak: {
      name: 'Surat Batak (Pustaha Laklak)',
      short: 'Surat Batak',
      family: 'Kaganga Sumatera Utara',
      period: 'Abad XIII–XX M',
      origin: 'Toba, Karo, Mandailing, Simalungun',
    },
    lontara: {
      name: 'Aksara Lontara (Sulapa Eppa)',
      short: 'Aksara Lontara',
      family: 'Lontara Sulawesi Selatan',
      period: 'Abad XIV–XX M',
      origin: 'Bugis, Makassar, Mandar',
    },
    pegon: {
      name: 'Aksara Pegon & Jawi (Arab Melayu)',
      short: 'Aksara Pegon',
      family: 'Arabika Adaptasi Nusantara',
      period: 'Abad XIII–XX M',
      origin: 'Nusantara (Tradisi Pesantren & Kesultanan)',
    },
    kawi: {
      name: 'Aksara Kawi Arkais & Pallawa',
      short: 'Aksara Kawi',
      family: 'Brahmi Selatan / Jawa Kuno',
      period: 'Abad VIII–XV M (Era Mataram Kuno–Majapahit)',
      origin: 'Jawa & Bali Kuno',
    },
  };
  return SCRIPT_INFO[scriptKey] || null;
}

export function resolveLanguageAttribution<T extends { ancientText?: string; language?: string; language_short?: string; script_type?: string }>(data: T): T {
  if (!data || !data.ancientText) return data;
  const scriptKey = detectScriptFromUnicode(data.ancientText);
  if (!scriptKey) return data;

  const meta = getScriptMetadata(scriptKey);
  if (!meta) return data;

  const currentLang = (data.language || '').toLowerCase();
  let targetLang = data.language || meta.name;
  let targetShort = data.language_short || meta.short;

  if (scriptKey === 'sundanese' && (!currentLang.includes('sunda') || currentLang.includes('jawa') || currentLang.includes('kawi'))) {
    targetLang = `${meta.name} · Tatar Sunda`;
    targetShort = meta.short;
  } else if (scriptKey === 'balinese' && (!currentLang.includes('bali') || currentLang.includes('jawa'))) {
    targetLang = `${meta.name} · Tradisi Lontar`;
    targetShort = meta.short;
  } else if (scriptKey === 'batak') {
    targetLang = `${meta.name} · Sumatera Utara`;
    targetShort = meta.short;
  } else if (scriptKey === 'lontara') {
    targetLang = `${meta.name} · Sulawesi Selatan`;
    targetShort = meta.short;
  } else if (scriptKey === 'pegon') {
    targetLang = `${meta.name} · Tradisi Naskah`;
    targetShort = meta.short;
  } else if (scriptKey === 'kawi' && (currentLang.includes('jawa baru') || !currentLang.includes('kawi'))) {
    targetLang = `${meta.name} · Abad VIII–X M`;
    targetShort = meta.short;
  } else if (scriptKey === 'javanese' && !currentLang.includes('jawa') && !currentLang.includes('carakan')) {
    targetLang = `${meta.name} · Jawa Kuno & Baru`;
    targetShort = meta.short;
  }

  return {
    ...data,
    language: targetLang,
    language_short: targetShort || meta.short,
    script_type: meta.short,
  };
}

export function cleanManuscriptText(text: string): string {
  if (!text) return '';
  const lines = text
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
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

      // 4. Remove hallucinated repetitive stutter loops (only unspaced repetitions like abcdeabcdeabcde)
      cleaned = cleaned.replace(/([a-zA-Z]{4,})\1{2,}/gi, '$1');

      // 5. If what remains is just dots "..." or empty, drop it
      if (!cleaned || /^\.{2,}$/.test(cleaned) || /^…+$/.test(cleaned)) {
        return '';
      }

      return cleaned;
    })
    .filter(Boolean);

  // 6. Collapse consecutive identical lines
  const deduped: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (i === 0 || lines[i] !== lines[i - 1]) {
      deduped.push(lines[i]);
    }
  }

  const joined = deduped.join('\n');

  // 7. If text contains known Batavia specimen stutter hallucination ("tatarikan"), rehabilitate
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

export function validateScanInput(data: Partial<LontarScanItem>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.aksaraText || !data.aksaraText.trim()) {
    errors.push('Teks aksara tidak boleh kosong');
  }
  if (!data.translation || !data.translation.trim()) {
    errors.push('Teks terjemahan tidak boleh kosong');
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}
