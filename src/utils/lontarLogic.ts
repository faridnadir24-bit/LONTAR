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
  const cleaned = text.replace(/\s+/g, ' ').trim();
  return {
    text: cleaned,
    lang: 'id-ID',
    rate: 0.95,
  };
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
