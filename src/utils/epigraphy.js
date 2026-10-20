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

export function extractGlyphs(ancientText, translit) {
  if (!ancientText) return [];
  const tokens = ancientText.trim().split(/\s+/);
  const result = [];

  tokens.forEach((word, wIdx) => {
    // Tokenize Javanese syllables (simple Brahmic cluster heuristic)
    const clusters = word.match(/[\uA980-\uA9DF]+/g) || [word];
    clusters.forEach((tok, cIdx) => {
      const hasWulu = tok.includes('ꦶ');
      const hasSuku = tok.includes('ꦸ');
      const hasTaling = tok.includes('ꦺ');
      const hasTalingTarung = tok.includes('ꦺꦴ') || (tok.includes('ꦺ') && tok.includes('ꦴ'));
      const hasPangkon = tok.includes('꧀');
      const hasCecak = tok.includes('ꦁ');
      const hasLayar = tok.includes('ꦂ');

      let type = 'Aksara Nglegena Dasar';
      let desc = `Aksara konsonan murni berbunyi vokal inheren terbuka /a/.`;

      if (hasPangkon) {
        type = 'Panyigeg Pangkon';
        desc = `Konsonan penutup yang dimatikan vokalnya menggunakan tanda paten Pangkon (꧀).`;
      } else if (hasTalingTarung) {
        type = 'Sandhangan Swara /o/';
        desc = `Dipasangi taling-tarung (ꦺ...ꦴ) yang mengubah vokal inheren menjadi vokal bundar /o/.`;
      } else if (hasWulu) {
        type = 'Sandhangan Swara Wulu';
        desc = `Dipasangi sandhangan wulu (ꦶ) yang melafalkan vokal tinggi /i/.`;
      } else if (hasSuku) {
        type = 'Sandhangan Swara Suku';
        desc = `Dipasangi sandhangan suku (ꦸ) yang melafalkan vokal tertutup /u/.`;
      } else if (hasTaling) {
        type = 'Sandhangan Swara Taling';
        desc = `Dipasangi sandhangan taling (ꦺ) yang melafalkan vokal madya /e/.`;
      } else if (hasCecak) {
        type = 'Panyigeg Cecak';
        desc = `Diakhiri konsonan sengau nasal /ng/ dengan sandhangan cecak (ꦁ).`;
      } else if (hasLayar) {
        type = 'Panyigeg Layar';
        desc = `Diakhiri konsonan getar /r/ dengan sandhangan layar (ꦂ).`;
      }

      result.push({
        char: tok,
        roman: `Glif ${wIdx + 1}.${cIdx + 1}`,
        type: type,
        desc: desc,
      });
    });
  });

  return result.length ? result : [
    { char: ancientText, roman: translit || 'Aksara', type: 'Glif Prasasti', desc: 'Analisis glif aksara kuno berbasis citra optik.' }
  ];
}
