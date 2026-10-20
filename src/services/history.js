/**
 * Local History & Archive Engine for LONTAR.ai
 */

import { DEFAULT_HISTORY } from '../data/manuscripts.js';
import { esc, showElement, hideElement, showToast, extractGlyphs } from '../utils/epigraphy.js';

let historyFilterTag = '';

export function getHistory() {
  try {
    const raw = localStorage.getItem('lontar_history');
    if (!raw) {
      saveHistory(DEFAULT_HISTORY);
      return DEFAULT_HISTORY;
    }
    return JSON.parse(raw);
  } catch (_) {
    return DEFAULT_HISTORY;
  }
}

export function saveHistory(items) {
  try {
    localStorage.setItem('lontar_history', JSON.stringify(items));
  } catch (_) {}
  updateScanCount();
}

export function updateScanCount() {
  const items = getHistory();
  const el = document.getElementById('stat-scans-count');
  if (el) el.textContent = (14 + Math.max(0, items.length - 2)) + '+';
}

export function setHistoryFilterTag(tag) {
  historyFilterTag = tag || '';
}

export function renderHistory(query = '', onSelectManuscript) {
  const histContainer = document.getElementById('history-list-container');
  const emptyState = document.getElementById('history-empty-state');
  if (!histContainer || !emptyState) return;

  let items = getHistory();
  const q = query.toLowerCase().trim();

  if (historyFilterTag) {
    items = items.filter(it => (it.language_short || '').toLowerCase().includes(historyFilterTag));
  }

  if (q) {
    items = items.filter(it =>
      it.title.toLowerCase().includes(q) ||
      it.translation.toLowerCase().includes(q) ||
      (it.ancientText && it.ancientText.toLowerCase().includes(q)) ||
      (it.transliteration && it.transliteration.toLowerCase().includes(q))
    );
  }

  histContainer.innerHTML = '';

  if (items.length === 0) {
    histContainer.classList.add('hidden');
    showElement(emptyState);
    return;
  }

  histContainer.classList.remove('hidden');
  hideElement(emptyState);

  items.forEach(item => {
    const card = document.createElement('article');
    card.className = 'history-card p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-slate-200/90 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-600 shadow-sm transition-all cursor-pointer';

    card.innerHTML = `
      <div class="flex items-start justify-between gap-3 mb-2.5">
        <div class="flex-1 min-w-0">
          <h4 class="text-[13px] font-bold text-slate-900 dark:text-zinc-100 truncate mb-0.5">${esc(item.title)}</h4>
          <p class="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">${esc(item.date)}</p>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">${esc(item.language_short || 'Aksara Kuno')}</span>
          <button type="button" data-id="${item.id}" class="btn-delete w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 dark:text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer" title="Hapus dari arsip">
            <svg class="w-3.5 h-3.5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </div>

      <div class="bg-slate-50/80 dark:bg-zinc-800/70 rounded-xl px-3.5 py-2.5 mb-2.5 border border-slate-200/80 dark:border-zinc-700/70">
        <p class="font-ancient-script text-[15px] font-medium text-slate-900 dark:text-zinc-100 tracking-wider truncate">${esc(item.ancientText)}</p>
        <p class="font-serif-literary text-[11px] text-slate-600 dark:text-zinc-400 italic mt-0.5 truncate">${esc(item.transliteration || '')}</p>
      </div>

      <p class="text-[12px] text-slate-600 dark:text-zinc-300 font-normal line-clamp-2 leading-relaxed mb-3">
        ${esc(item.translation)}
      </p>

      <div class="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] font-semibold text-slate-900 dark:text-white">
        <span>Buka Kajian Filologi</span>
        <svg class="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 group-hover:translate-x-0.5 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    `;

    // Card click opens Result
    card.addEventListener('click', function (e) {
      if (e.target.closest('.btn-delete')) return;
      const manuscriptData = {
        title: item.title,
        ancientText: item.ancientText,
        transliteration: item.transliteration || '',
        translation: item.translation,
        philosophical: item.philosophical || '',
        language: item.language || '',
        language_short: item.language_short || 'Aksara Kuno',
        confidence: item.confidence || 98.8,
        glyphs: item.glyphs || extractGlyphs(item.ancientText, item.transliteration),
        lineByLine: item.lineByLine || [],
        lexicon: item.lexicon || [],
      };
      if (typeof onSelectManuscript === 'function') {
        onSelectManuscript(manuscriptData);
      }
    });

    // Delete button
    const delBtn = card.querySelector('.btn-delete');
    if (delBtn) {
      delBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const items = getHistory().filter(it => it.id !== this.dataset.id);
        saveHistory(items);
        const searchInput = document.getElementById('history-search');
        renderHistory(searchInput ? searchInput.value : '', onSelectManuscript);
        showToast('Naskah dihapus dari arsip');
      });
    }

    histContainer.appendChild(card);
  });
}
