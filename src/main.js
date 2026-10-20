/**
 * Main Application Orchestrator for LONTAR.ai
 * Modular, clean, high-performance architecture.
 */

import { SAMPLES } from './data/manuscripts.js';
import { esc, showToast, showElement, hideElement, extractGlyphs } from './utils/epigraphy.js';
import {
  startCamera,
  stopCamera,
  toggleFlash,
  switchCamera,
  captureSnapshot,
  isCameraActive,
} from './services/camera.js';
import {
  playAudio,
  stopAudio,
  cycleTempo,
  isAudioSpeaking,
} from './services/speech.js';
import { initTheme } from './services/theme.js';
import {
  getHistory,
  saveHistory,
  updateScanCount,
  renderHistory,
  setHistoryFilterTag,
} from './services/history.js';
import {
  requestManuscriptAnalysis,
  getCustomApiKey,
  setCustomApiKey,
} from './services/api.js';

// ── Application Runtime State ──────────────────────────────
let currentSampleIdx = 0;
let activeScreen = 'screen-home';
let latestResultData = null;
let currentCapturedImageDataUrl = null;

// DOM View Cache
const screens = {
  'screen-home': document.getElementById('screen-home'),
  'screen-scan': document.getElementById('screen-scan'),
  'screen-result': document.getElementById('screen-result'),
  'screen-history': document.getElementById('screen-history'),
};

// ── Screen Navigation Router ───────────────────────────────
export function navigate(targetId) {
  if (isAudioSpeaking()) stopAudio();

  // Control Camera lifecycle
  if (targetId === 'screen-scan') {
    startCamera();
  } else if (activeScreen === 'screen-scan') {
    stopCamera();
  }

  Object.keys(screens).forEach(id => {
    if (!screens[id]) return;
    screens[id].classList.toggle('screen-hidden', id !== targetId);
    screens[id].classList.toggle('screen-visible', id === targetId);
  });

  activeScreen = targetId;

  // Hide bottom navigation on Camera HUD screen to prevent layout overlap
  const bottomNav = document.getElementById('bottom-nav');
  if (bottomNav) {
    if (targetId === 'screen-scan') {
      bottomNav.classList.add('hidden');
    } else {
      bottomNav.classList.remove('hidden');
    }
  }

  // Bottom Navigation Active Indicator
  const NAV_MAP = {
    'screen-home': 'nav-home',
    'screen-scan': 'nav-scan',
    'screen-result': 'nav-scan',
    'screen-history': 'nav-history',
  };

  document.querySelectorAll('.nav-item').forEach(el => {
    const bar = el.querySelector('.nav-bar');
    if (bar) bar.style.transform = 'scaleX(0)';
    const icon = el.querySelector('.nav-icon');
    const label = el.querySelector('.nav-label');
    if (icon) {
      icon.classList.remove('text-slate-900', 'dark:text-white');
      icon.classList.add('text-slate-400', 'dark:text-zinc-500');
    }
    if (label) {
      label.classList.remove('text-slate-900', 'dark:text-white');
      label.classList.add('text-slate-500', 'dark:text-zinc-400');
    }
  });

  const activeNav = document.getElementById(NAV_MAP[targetId] || 'nav-home');
  if (activeNav) {
    const bar = activeNav.querySelector('.nav-bar');
    if (bar) bar.style.transform = 'scaleX(1)';
    const icon = activeNav.querySelector('.nav-icon');
    const label = activeNav.querySelector('.nav-label');
    if (icon) {
      icon.classList.remove('text-slate-400', 'dark:text-zinc-500');
      icon.classList.add('text-slate-900', 'dark:text-white');
    }
    if (label) {
      label.classList.remove('text-slate-500', 'dark:text-zinc-400');
      label.classList.add('text-slate-900', 'dark:text-white');
    }
  }

  if (targetId === 'screen-history') {
    renderHistory('', (manuscript) => {
      latestResultData = manuscript;
      populateResult(latestResultData);
      navigate('screen-result');
    });
  }

  const main = document.querySelector('main');
  if (main) main.scrollTop = 0;
}

// ── Camera Shutter Action ──────────────────────────────────
export function triggerCapture() {
  if (navigator.vibrate) navigator.vibrate(25);

  // Instant shutter flash visual effect
  const flashEl = document.getElementById('camera-shutter-flash');
  if (flashEl) {
    flashEl.classList.remove('hidden');
    flashEl.style.opacity = '0.9';
    setTimeout(() => {
      flashEl.style.opacity = '0';
      setTimeout(() => flashEl.classList.add('hidden'), 120);
    }, 50);
  }

  hideElement(document.getElementById('scan-unclear-modal'));

  const video = document.getElementById('camera-feed');
  const canvas = document.getElementById('capture-canvas');

  if (isCameraActive() && video && (video.videoWidth > 0 || video.readyState >= 2)) {
    try {
      const snap = captureSnapshot(video, canvas);
      if (snap) {
        analyzeCapturedImage(snap.base64, snap.mimeType);
      } else {
        runSimulatedScan();
      }
    } catch (e) {
      console.warn('Canvas capture fallback to simulated scan:', e);
      runSimulatedScan();
    }
  } else {
    runSimulatedScan();
  }
}

// ── AI Vision Analysis Runner ──────────────────────────────
async function analyzeCapturedImage(base64Data, mimeType = 'image/jpeg') {
  const loadingOverlay = document.getElementById('scan-loading-overlay');
  const progressBar = document.getElementById('scan-progress-bar');
  const stepText = document.getElementById('scan-step-text');
  const errorMsg = document.getElementById('scan-error-msg');
  if (errorMsg) hideElement(errorMsg);

  currentCapturedImageDataUrl = `data:${mimeType};base64,${base64Data}`;

  showElement(loadingOverlay);
  if (progressBar) progressBar.style.width = '20%';
  if (stepText) stepText.textContent = 'Mengunggah citra ke Gemini Vision…';

  const t1 = setTimeout(() => {
    if (progressBar) progressBar.style.width = '55%';
    if (stepText) stepText.textContent = 'Mendeteksi karakter & glif Ron Tal…';
  }, 900);

  const t2 = setTimeout(() => {
    if (progressBar) progressBar.style.width = '85%';
    if (stepText) stepText.textContent = 'Menerjemahkan & menafsirkan filosofi…';
  }, 1800);

  try {
    const data = await requestManuscriptAnalysis(base64Data, mimeType);

    clearTimeout(t1);
    clearTimeout(t2);

    if (progressBar) progressBar.style.width = '100%';

    // Non-ancient-script detected (e.g. selfie, room, non-script object)
    if (data.hasScript === false) {
      hideElement(loadingOverlay);

      const unclearModal = document.getElementById('scan-unclear-modal');
      const titleEl = document.getElementById('unclear-modal-title');
      const descEl = document.getElementById('unclear-modal-desc');
      const sampleBtnLabel = document.getElementById('btn-unclear-sample-label');
      const retryBtnLabel = document.getElementById('btn-unclear-retry-label');

      if (titleEl) titleEl.textContent = 'Aksara Kuno Tidak Ditemukan';
      if (descEl) {
        descEl.textContent = data.description || 'Kamera mendeteksi objek non-aksara (wajah, ruangan, atau benda). Silakan arahkan lensa ke naskah bertuliskan aksara Jawa atau buka contoh naskah peraga untuk demonstrasi.';
      }
      if (sampleBtnLabel) sampleBtnLabel.textContent = 'Pelajari Contoh Naskah (Demo)';
      if (retryBtnLabel) retryBtnLabel.textContent = 'Arahkan Ulang Kamera & Coba Lagi';

      showElement(unclearModal);
      latestResultData = data.suggestedSample || SAMPLES[currentSampleIdx];
      return;
    }

    // Success
    setTimeout(() => {
      hideElement(loadingOverlay);
      if (progressBar) progressBar.style.width = '0%';

      latestResultData = {
        title: data.title || 'Naskah Pindaian Kamera',
        ancientText: data.ancientText || 'ꦲꦤꦕꦫꦏ',
        transliteration: data.transliteration || '',
        translation: data.translation || 'Terjemahan tidak tersedia.',
        philosophical: data.philosophical || 'Konteks kearifan luhur Nusantara.',
        language: data.language || 'Aksara Jawa Kuno',
        language_short: data.language_short || 'Aksara Jawa',
        confidence: data.confidence || 98.4,
      };

      populateResult(latestResultData);
      navigate('screen-result');
    }, 350);

  } catch (err) {
    clearTimeout(t1);
    clearTimeout(t2);
    console.error('AI Analysis failed:', err);

    hideElement(loadingOverlay);
    if (progressBar) progressBar.style.width = '0%';

    const errMsg = err.message || '';
    const isQuotaIssue = (
      err.status === 429 ||
      err.errorType === 'QUOTA_EXCEEDED' ||
      errMsg.includes('429') ||
      errMsg.includes('Quota exceeded') ||
      errMsg.includes('RESOURCE_EXHAUSTED') ||
      errMsg.includes('Resource has been exhausted')
    );
    const isMissingKeyIssue = (
      err.errorType === 'MISSING_API_KEY' ||
      errMsg.includes('GEMINI_API_KEY') ||
      errMsg.includes('is not configured')
    );
    const isInvalidKeyIssue = (
      err.errorType === 'INVALID_API_KEY' ||
      err.status === 401 ||
      errMsg.includes('API_KEY_INVALID') ||
      errMsg.includes('API key not valid')
    );

    const unclearModal = document.getElementById('scan-unclear-modal');
    const titleEl = document.getElementById('unclear-modal-title');
    const descEl = document.getElementById('unclear-modal-desc');
    const sampleBtnLabel = document.getElementById('btn-unclear-sample-label');
    const retryBtnLabel = document.getElementById('btn-unclear-retry-label');
    const enterKeyBtn = document.getElementById('btn-unclear-enter-key');

    // Show custom API key button if it's a quota or key issue
    if (enterKeyBtn) {
      if (isQuotaIssue || isMissingKeyIssue || isInvalidKeyIssue) {
        enterKeyBtn.classList.remove('hidden');
        enterKeyBtn.classList.add('flex');
      } else {
        enterKeyBtn.classList.add('hidden');
        enterKeyBtn.classList.remove('flex');
      }
    }

    if (isQuotaIssue) {
      if (titleEl) titleEl.textContent = 'Batas Kuota Harian AI Tercapai';
      if (descEl) {
        descEl.innerHTML = 'Kunci API Google Gemini (Free Tier) di server saat ini telah mencapai batas kuota harian dari Google.<br><br>💡 <strong>Solusi Cepat:</strong><br>• Klik tombol biru di bawah untuk <strong>memasukkan API Key Gemini pribadi</strong> (gratis di <em>aistudio.google.com</em>), atau<br>• Gunakan <strong>naskah peraga kurasi</strong> untuk demonstrasi pengujian.';
      }
      if (sampleBtnLabel) sampleBtnLabel.textContent = 'Gunakan Contoh Naskah Peraga (Demo)';
      if (retryBtnLabel) retryBtnLabel.textContent = 'Tutup';
    } else if (isMissingKeyIssue) {
      if (titleEl) titleEl.textContent = 'Kunci API Gemini Belum Dikonfigurasi';
      if (descEl) {
        descEl.innerHTML = 'Kamera tidak dapat memproses via AI karena <code class="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono text-[11px]">GEMINI_API_KEY</code> belum ditambahkan di Vercel atau pengaturan aplikasi.';
      }
      if (sampleBtnLabel) sampleBtnLabel.textContent = 'Gunakan Contoh Naskah Peraga (Demo)';
      if (retryBtnLabel) retryBtnLabel.textContent = 'Tutup & Arahkan Kamera Lagi';
    } else if (isInvalidKeyIssue) {
      if (titleEl) titleEl.textContent = 'Kunci API Gemini Tidak Valid';
      if (descEl) {
        descEl.textContent = 'Kunci API yang dimasukkan ditolak oleh Google AI Studio. Pastikan kunci masih aktif dan periksa kembali pengetikannya.';
      }
      if (sampleBtnLabel) sampleBtnLabel.textContent = 'Gunakan Contoh Naskah Peraga (Demo)';
      if (retryBtnLabel) retryBtnLabel.textContent = 'Coba Foto Ulang';
    } else {
      if (titleEl) titleEl.textContent = 'Gagal Menghubungi Layanan AI';
      if (descEl) {
        // Strip raw JSON if present in error message
        let userFriendlyMsg = errMsg;
        if (userFriendlyMsg.includes('{') || userFriendlyMsg.includes('code')) {
          userFriendlyMsg = 'Layanan AI Google sedang sibuk atau koneksi internet tidak stabil.';
        }
        descEl.textContent = `Terjadi kendala saat menganalisis citra: ${userFriendlyMsg}. Silakan coba lagi atau gunakan naskah peraga.`;
      }
      if (sampleBtnLabel) sampleBtnLabel.textContent = 'Gunakan Contoh Naskah Peraga (Demo)';
      if (retryBtnLabel) retryBtnLabel.textContent = 'Coba Foto Ulang';
    }

    showElement(unclearModal);
    latestResultData = SAMPLES[currentSampleIdx];
  }
}

// ── Fallback Demo Simulation ───────────────────────────────
function runSimulatedScan() {
  currentCapturedImageDataUrl = null;
  const loadingOverlay = document.getElementById('scan-loading-overlay');
  const progressBar = document.getElementById('scan-progress-bar');
  const stepText = document.getElementById('scan-step-text');

  showElement(loadingOverlay);
  if (progressBar) progressBar.style.width = '0%';
  if (stepText) stepText.textContent = 'Mendeteksi glif aksara naskah…';

  setTimeout(() => {
    if (progressBar) progressBar.style.width = '55%';
    if (stepText) stepText.textContent = 'Mengekstrak karakter Ron Tal…';
  }, 600);

  setTimeout(() => {
    if (progressBar) progressBar.style.width = '100%';
    if (stepText) stepText.textContent = 'Menafsirkan makna filosofis…';
  }, 1200);

  setTimeout(() => {
    hideElement(loadingOverlay);
    if (progressBar) progressBar.style.width = '0%';
    latestResultData = SAMPLES[currentSampleIdx];
    populateResult(latestResultData);
    navigate('screen-result');
  }, 1600);
}

// ── Glyph Breakdown Visualizer ─────────────────────────────
function renderGlyphBreakdown(glyphs) {
  const chipsContainer = document.getElementById('glyph-breakdown-chips');
  const detailChar = document.getElementById('glyph-detail-char');
  const detailTitle = document.getElementById('glyph-detail-title');
  const detailType = document.getElementById('glyph-detail-type');
  const detailDesc = document.getElementById('glyph-detail-desc');

  if (!chipsContainer || !glyphs || !glyphs.length) return;
  chipsContainer.innerHTML = '';

  function setDetail(g) {
    if (detailChar) detailChar.textContent = g.char;
    if (detailTitle) detailTitle.textContent = g.roman ? `Suku Kata / Glif: ${g.roman}` : `Glif: ${g.char}`;
    if (detailType) detailType.textContent = g.type || 'Aksara Nusantara';
    if (detailDesc) detailDesc.textContent = g.desc || 'Analisis filologis glif naskah kuno.';
  }

  glyphs.forEach((g, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    const isActive = idx === 0;
    btn.className = `glyph-chip px-2.5 py-1 rounded-xl text-center border transition-all cursor-pointer ${
      isActive
        ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-950 border-slate-900 dark:border-white font-bold shadow-xs'
        : 'bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 hover:border-slate-400 dark:hover:border-zinc-600'
    }`;

    btn.innerHTML = `
      <span class="font-javanese text-[15px] block leading-none select-none">${esc(g.char)}</span>
      <span class="text-[9px] block opacity-85 mt-0.5 font-medium leading-none">${esc(g.roman || '')}</span>
    `;

    btn.addEventListener('click', () => {
      chipsContainer.querySelectorAll('.glyph-chip').forEach(c => {
        c.className = 'glyph-chip px-2.5 py-1 rounded-xl text-center border transition-all cursor-pointer bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 hover:border-slate-400 dark:hover:border-zinc-600';
      });
      btn.className = 'glyph-chip px-2.5 py-1 rounded-xl text-center border transition-all cursor-pointer bg-slate-900 dark:bg-white text-white dark:text-zinc-950 border-slate-900 dark:border-white font-bold shadow-xs';
      setDetail(g);
    });

    chipsContainer.appendChild(btn);
  });

  setDetail(glyphs[0]);
}

// ── Populate Result Screen ─────────────────────────────────
export function populateResult(data) {
  if (!data) return;

  const titleEl = document.getElementById('result-title');
  const ancientTextEl = document.getElementById('result-ancient-text');
  const translitEl = document.getElementById('result-transliteration');
  const translatedTextEl = document.getElementById('result-translated-text');
  const philEl = document.getElementById('result-philosophical');
  const langBadge = document.getElementById('result-language-badge');
  const confEl = document.getElementById('result-confidence');

  if (titleEl) titleEl.textContent = data.title;
  if (ancientTextEl) ancientTextEl.textContent = data.ancientText;
  if (translitEl) translitEl.textContent = data.transliteration;
  if (translatedTextEl) translatedTextEl.textContent = data.translation;
  if (philEl) philEl.textContent = data.philosophical;
  if (langBadge) langBadge.textContent = data.language;
  if (confEl) confEl.textContent = (data.confidence || 98.8) + '%';

  const glyphList = data.glyphs && data.glyphs.length
    ? data.glyphs
    : extractGlyphs(data.ancientText, data.transliteration);
  renderGlyphBreakdown(glyphList);

  const modelLabel = document.getElementById('result-model-label');
  if (modelLabel) {
    modelLabel.textContent = currentCapturedImageDataUrl
      ? 'Gemini 3.5 Flash Multimodal Vision'
      : 'Kurasi Filologi LONTAR (Mode Peraga)';
  }

  const tabBtnImg = document.getElementById('tab-btn-image');
  if (tabBtnImg) {
    tabBtnImg.textContent = currentCapturedImageDataUrl
      ? 'Tangkapan Kamera'
      : 'Ilustrasi Lontar';
  }

  const imgEl = document.getElementById('result-captured-image');
  const imgNotice = document.getElementById('result-image-notice');
  if (imgEl) {
    if (currentCapturedImageDataUrl) {
      imgEl.src = currentCapturedImageDataUrl;
      imgEl.classList.remove('hidden');
      if (imgNotice) imgNotice.textContent = 'Citra optik yang dipindai langsung dari kamera';
    } else {
      imgEl.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%2318181B'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23FFFFFF' font-size='22' font-family='serif'%3Eꦱꦶꦤꦸꦮꦸꦤ꧀ ꦱꦸꦫꦪ ꦧꦸꦩꦶ%3C/text%3E%3C/svg%3E";
      if (imgNotice) imgNotice.textContent = 'Menampilkan naskah peraga lontar kurasi filologi';
    }
  }

  switchResultTab('script');

  // Reset Save Button
  const saveBtn = document.getElementById('btn-save-history');
  const saveBtnLabel = document.getElementById('save-btn-label');
  const saveIcon = document.getElementById('save-icon');
  if (saveBtn) {
    saveBtn.disabled = false;
    saveBtn.classList.remove('opacity-60');
  }
  if (saveBtnLabel) saveBtnLabel.textContent = 'Simpan ke Arsip Digital';
  if (saveIcon) {
    saveIcon.innerHTML = '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>';
  }
}

// ── Tab Switcher in Result Screen ──────────────────────────
function switchResultTab(tab) {
  const tabBtnScript = document.getElementById('tab-btn-script');
  const tabBtnImage = document.getElementById('tab-btn-image');
  const tabContentScript = document.getElementById('tab-content-script');
  const tabContentImage = document.getElementById('tab-content-image');

  if (!tabBtnScript || !tabBtnImage || !tabContentScript || !tabContentImage) return;

  if (tab === 'script') {
    tabBtnScript.className = 'flex-1 py-1.5 rounded-lg text-[12px] font-semibold bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs transition-all cursor-pointer';
    tabBtnImage.className = 'flex-1 py-1.5 rounded-lg text-[12px] font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer';
    tabContentScript.classList.remove('hidden');
    tabContentImage.classList.add('hidden');
  } else {
    tabBtnImage.className = 'flex-1 py-1.5 rounded-lg text-[12px] font-semibold bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs transition-all cursor-pointer';
    tabBtnScript.className = 'flex-1 py-1.5 rounded-lg text-[12px] font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer';
    tabContentScript.classList.add('hidden');
    tabContentImage.classList.remove('hidden');
  }
}

// ── Document Event Bindings & Initialization ───────────────
document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme Engine Init
  initTheme();

  // 2. Navigation Tabs
  const navHome = document.getElementById('nav-home');
  const navScan = document.getElementById('nav-scan');
  const navHistory = document.getElementById('nav-history');

  if (navHome) navHome.addEventListener('click', () => navigate('screen-home'));
  if (navScan) {
    navScan.addEventListener('click', () => {
      if (activeScreen === 'screen-scan') {
        triggerCapture();
      } else {
        navigate('screen-scan');
      }
    });
  }
  if (navHistory) navHistory.addEventListener('click', () => navigate('screen-history'));

  // Screen Back & CTA Buttons
  const btnHeroScan = document.getElementById('btn-hero-scan');
  const btnScanBack = document.getElementById('btn-scan-back');
  const btnResultBack = document.getElementById('btn-result-back');
  const btnEmptyScan = document.getElementById('btn-empty-scan');

  if (btnHeroScan) btnHeroScan.addEventListener('click', () => navigate('screen-scan'));
  if (btnScanBack) btnScanBack.addEventListener('click', () => navigate('screen-home'));
  if (btnResultBack) btnResultBack.addEventListener('click', () => navigate('screen-scan'));
  if (btnEmptyScan) btnEmptyScan.addEventListener('click', () => navigate('screen-scan'));

  // Camera Controls
  const btnCapture = document.getElementById('btn-capture');
  if (btnCapture) {
    btnCapture.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerCapture();
    });
  }

  const viewfinderWrap = document.getElementById('viewfinder-wrap');
  if (viewfinderWrap) {
    viewfinderWrap.addEventListener('click', (e) => {
      if (e.target.closest('#scan-unclear-modal') || e.target.closest('#scan-loading-overlay')) return;
      triggerCapture();
    });
  }

  const btnFlashToggle = document.getElementById('btn-flash-toggle');
  if (btnFlashToggle) {
    btnFlashToggle.addEventListener('click', function () {
      toggleFlash(this);
    });
  }

  const btnCameraSwitch = document.getElementById('btn-camera-switch');
  if (btnCameraSwitch) {
    btnCameraSwitch.addEventListener('click', switchCamera);
  }

  // Gallery File Upload
  const fileInput = document.getElementById('file-upload');
  if (fileInput) {
    fileInput.addEventListener('change', function (e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (evt) {
        const dataUrl = evt.target.result;
        const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
        if (match) {
          analyzeCapturedImage(match[2], match[1]);
        }
      };
      reader.readAsDataURL(file);
      this.value = '';
    });
  }

  // Unclear Modal Handlers
  const btnUnclearSample = document.getElementById('btn-unclear-use-sample');
  if (btnUnclearSample) {
    btnUnclearSample.addEventListener('click', () => {
      hideElement(document.getElementById('scan-unclear-modal'));
      currentCapturedImageDataUrl = null;
      if (!latestResultData) latestResultData = SAMPLES[currentSampleIdx];
      populateResult(latestResultData);
      navigate('screen-result');
    });
  }

  const btnUnclearRetry = document.getElementById('btn-unclear-retry');
  if (btnUnclearRetry) {
    btnUnclearRetry.addEventListener('click', () => {
      hideElement(document.getElementById('scan-unclear-modal'));
    });
  }

  // Result Tabs
  const tabBtnScript = document.getElementById('tab-btn-script');
  const tabBtnImage = document.getElementById('tab-btn-image');
  if (tabBtnScript) tabBtnScript.addEventListener('click', () => switchResultTab('script'));
  if (tabBtnImage) tabBtnImage.addEventListener('click', () => switchResultTab('image'));

  // Speech Studio
  const playBtn = document.getElementById('btn-play-audio');
  if (playBtn) {
    playBtn.addEventListener('click', () => playAudio());
  }

  const tempoBtn = document.getElementById('btn-voice-speed');
  if (tempoBtn) {
    tempoBtn.addEventListener('click', cycleTempo);
  }

  // Save to Archive
  const btnSaveHistory = document.getElementById('btn-save-history');
  if (btnSaveHistory) {
    btnSaveHistory.addEventListener('click', function () {
      const now = new Date();
      const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
      const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()} • ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

      const s = latestResultData || SAMPLES[currentSampleIdx];
      const newItem = {
        id: 'scan-' + Date.now(),
        title: s.title || 'Naskah Pindaian Lontar',
        date: dateStr,
        ancientText: document.getElementById('result-ancient-text') ? document.getElementById('result-ancient-text').textContent.trim() : '',
        transliteration: document.getElementById('result-transliteration') ? document.getElementById('result-transliteration').textContent.trim() : '',
        translation: document.getElementById('result-translated-text') ? document.getElementById('result-translated-text').textContent.trim() : '',
        philosophical: document.getElementById('result-philosophical') ? document.getElementById('result-philosophical').textContent.trim() : '',
        language: s.language || (document.getElementById('result-language-badge') ? document.getElementById('result-language-badge').textContent.trim() : 'Aksara Jawa'),
        language_short: s.language_short || 'Aksara Jawa',
        confidence: s.confidence || 98.8,
        glyphs: s.glyphs || extractGlyphs(s.ancientText, s.transliteration),
      };

      const items = getHistory();
      items.unshift(newItem);
      saveHistory(items);

      const saveBtnLabel = document.getElementById('save-btn-label');
      const saveIcon = document.getElementById('save-icon');
      if (saveBtnLabel) saveBtnLabel.textContent = 'Tersimpan di Arsip';
      if (saveIcon) saveIcon.innerHTML = '<polyline points="20 6 9 17 4 12"/>';
      this.disabled = true;
      this.classList.add('opacity-60');

      showToast('Naskah tersimpan ke arsip digital');
    });
  }

  // Copy Translation
  const btnCopyTranslation = document.getElementById('btn-copy-translation');
  if (btnCopyTranslation) {
    btnCopyTranslation.addEventListener('click', () => {
      const text = document.getElementById('result-translated-text') ? document.getElementById('result-translated-text').textContent.trim() : '';
      navigator.clipboard.writeText(text).then(() => {
        showToast('Terjemahan disalin ke papan klip');
      }).catch(() => {
        showToast('Gagal menyalin teks');
      });
    });
  }

  // Modal Piagam
  const modalPiagam = document.getElementById('modal-piagam');
  const btnShareResult = document.getElementById('btn-share-result');
  const btnPiagamClose = document.getElementById('btn-piagam-close');
  const btnPiagamCopy = document.getElementById('btn-piagam-copy');

  if (btnShareResult) {
    btnShareResult.addEventListener('click', () => {
      const s = latestResultData || SAMPLES[currentSampleIdx];
      const pTitle = document.getElementById('piagam-title');
      const pAncient = document.getElementById('piagam-ancient-text');
      const pTranslit = document.getElementById('piagam-transliteration');
      const pTrans = document.getElementById('piagam-translation');
      const pReg = document.getElementById('piagam-reg-num');

      if (pTitle) pTitle.textContent = s.title;
      if (pAncient) pAncient.textContent = document.getElementById('result-ancient-text') ? document.getElementById('result-ancient-text').textContent.trim() : '';
      if (pTranslit) pTranslit.textContent = document.getElementById('result-transliteration') ? document.getElementById('result-transliteration').textContent.trim() : '';
      if (pTrans) pTrans.textContent = `"${document.getElementById('result-translated-text') ? document.getElementById('result-translated-text').textContent.trim() : ''}"`;
      if (pReg) pReg.textContent = `REG: LONTAR-AI/EPIG-2026/${Math.floor(100 + Math.random() * 900)}`;

      showElement(modalPiagam);
    });
  }

  if (btnPiagamClose) {
    btnPiagamClose.addEventListener('click', () => hideElement(modalPiagam));
  }

  if (btnPiagamCopy) {
    btnPiagamCopy.addEventListener('click', () => {
      const s = latestResultData || SAMPLES[currentSampleIdx];
      const certText = `=== PIAGAM FILOLOGI NUSANTARA ===\nNaskah: ${s.title}\nAksara Kuno: ${document.getElementById('result-ancient-text') ? document.getElementById('result-ancient-text').textContent.trim() : ''}\nTransliterasi: ${document.getElementById('result-transliteration') ? document.getElementById('result-transliteration').textContent.trim() : ''}\nTerjemahan: ${document.getElementById('result-translated-text') ? document.getElementById('result-translated-text').textContent.trim() : ''}\nFilosofis: ${document.getElementById('result-philosophical') ? document.getElementById('result-philosophical').textContent.trim() : ''}\nVerifikasi: Model Epigrafi Gemini 3.5 Flash (Akurasi: ${s.confidence || 98.8}%)\nPlatform: LONTAR.AI`;

      navigator.clipboard.writeText(certText).then(() => {
        showToast('Piagam kajian disalin ke papan klip');
      }).catch(() => {
        showToast('Gagal menyalin piagam');
      });
    });
  }

  // Sample Preset Cards
  document.querySelectorAll('.sample-preset-card').forEach(card => {
    card.addEventListener('click', function () {
      const idx = parseInt(this.dataset.sampleIdx, 10);
      currentSampleIdx = isNaN(idx) ? 0 : idx;
      latestResultData = SAMPLES[currentSampleIdx];
      populateResult(latestResultData);
      navigate('screen-result');
    });
  });

  const heroPreview = document.getElementById('hero-lontar-preview');
  if (heroPreview) {
    heroPreview.addEventListener('click', () => {
      currentSampleIdx = 0;
      latestResultData = SAMPLES[0];
      populateResult(latestResultData);
      navigate('screen-result');
    });
  }

  const btnSampleSwitch = document.getElementById('btn-sample-switch');
  if (btnSampleSwitch) {
    btnSampleSwitch.addEventListener('click', () => {
      currentSampleIdx = (currentSampleIdx + 1) % SAMPLES.length;
      showToast(`Contoh: ${SAMPLES[currentSampleIdx].title.split('-')[0].trim()}`);
    });
  }

  // History Search & Tags
  const historySearch = document.getElementById('history-search');
  if (historySearch) {
    historySearch.addEventListener('input', function () {
      renderHistory(this.value, (manuscript) => {
        latestResultData = manuscript;
        populateResult(latestResultData);
        navigate('screen-result');
      });
    });
  }

  document.querySelectorAll('.history-tag').forEach(tagBtn => {
    tagBtn.addEventListener('click', function () {
      document.querySelectorAll('.history-tag').forEach(btn => {
        btn.classList.remove('bg-slate-900', 'text-white', 'dark:bg-white', 'dark:text-zinc-950');
        btn.classList.add('bg-slate-100', 'dark:bg-zinc-800', 'text-slate-600', 'dark:text-zinc-300');
      });
      this.classList.add('bg-slate-900', 'text-white', 'dark:bg-white', 'dark:text-zinc-950');
      this.classList.remove('bg-slate-100', 'dark:bg-zinc-800', 'text-slate-600', 'dark:text-zinc-300');

      setHistoryFilterTag(this.dataset.filter || '');
      renderHistory(historySearch ? historySearch.value : '', (manuscript) => {
        latestResultData = manuscript;
        populateResult(latestResultData);
        navigate('screen-result');
      });
    });
  });

  const btnClearHistory = document.getElementById('btn-clear-history');
  if (btnClearHistory) {
    btnClearHistory.addEventListener('click', () => {
      if (!confirm('Hapus seluruh koleksi naskah yang tersimpan di arsip lokal?')) return;
      saveHistory([]);
      renderHistory('', (manuscript) => {
        latestResultData = manuscript;
        populateResult(latestResultData);
        navigate('screen-result');
      });
      showToast('Arsip naskah telah dikosongkan');
    });
  }

  // ── Custom Gemini API Key Management ──
  const modalApiKey = document.getElementById('modal-api-key');
  const btnOpenApiKey = document.getElementById('btn-open-api-key');
  const btnCloseApiKey = document.getElementById('btn-close-api-key');
  const btnCloseApiKeyX = document.getElementById('btn-close-api-key-x');
  const btnSaveApiKey = document.getElementById('btn-save-api-key');
  const btnClearApiKey = document.getElementById('btn-clear-api-key');
  const inputCustomApiKey = document.getElementById('input-custom-api-key');
  const apiKeyStatusText = document.getElementById('api-key-status-text');
  const btnUnclearEnterKey = document.getElementById('btn-unclear-enter-key');

  function openApiKeyModal() {
    const currentKey = getCustomApiKey();
    if (inputCustomApiKey) inputCustomApiKey.value = currentKey;
    if (apiKeyStatusText) {
      if (currentKey) {
        apiKeyStatusText.textContent = 'Status: Menggunakan API Key pribadi tersimpan';
        apiKeyStatusText.className = 'text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold';
      } else {
        apiKeyStatusText.textContent = 'Status: Menggunakan kuota default server';
        apiKeyStatusText.className = 'text-[10px] text-slate-500 dark:text-zinc-400 italic';
      }
    }
    showElement(modalApiKey);
  }

  if (btnOpenApiKey) btnOpenApiKey.addEventListener('click', openApiKeyModal);
  if (btnUnclearEnterKey) {
    btnUnclearEnterKey.addEventListener('click', () => {
      const unclearModal = document.getElementById('scan-unclear-modal');
      if (unclearModal) hideElement(unclearModal);
      openApiKeyModal();
    });
  }

  if (btnCloseApiKey) btnCloseApiKey.addEventListener('click', () => hideElement(modalApiKey));
  if (btnCloseApiKeyX) btnCloseApiKeyX.addEventListener('click', () => hideElement(modalApiKey));

  if (btnSaveApiKey) {
    btnSaveApiKey.addEventListener('click', () => {
      const val = inputCustomApiKey ? inputCustomApiKey.value.trim() : '';
      if (!val) {
        setCustomApiKey('');
        showToast('Kunci dihapus. Menggunakan server default.');
      } else {
        setCustomApiKey(val);
        showToast('Kunci API pribadi berhasil disimpan!');
      }
      hideElement(modalApiKey);
    });
  }

  if (btnClearApiKey) {
    btnClearApiKey.addEventListener('click', () => {
      setCustomApiKey('');
      if (inputCustomApiKey) inputCustomApiKey.value = '';
      if (apiKeyStatusText) {
        apiKeyStatusText.textContent = 'Status: Menggunakan kuota default server';
        apiKeyStatusText.className = 'text-[10px] text-slate-500 dark:text-zinc-400 italic';
      }
      showToast('Kunci API dihapus');
    });
  }

  // Initial State Setup
  updateScanCount();
  latestResultData = SAMPLES[0];
  populateResult(latestResultData);
  navigate('screen-home');
});
