/**
 * Speech Synthesis Audio Studio for LONTAR.ai
 * Ultra-responsive, mobile-optimized Indonesian recitation with voice cache and keep-alive
 */

import { VOICE_TEMPOS } from '../data/manuscripts.js';
import { showToast } from '../utils/epigraphy.js';

let isSpeaking = false;
let isPreparing = false;
let currentTempoIdx = 0;
let currentUtterance = null;
let keepAliveTimer = null;
let cachedVoices = [];

// Preload & cache browser speech synthesis voices immediately
function initVoices() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      cachedVoices = window.speechSynthesis.getVoices() || [];
      if (!cachedVoices.length) {
        window.speechSynthesis.onvoiceschanged = () => {
          try {
            cachedVoices = window.speechSynthesis.getVoices() || [];
          } catch (_) {}
        };
      }
    } catch (_) {}
  }
}
initVoices();

export function isAudioSpeaking() {
  return isSpeaking;
}

export function getCurrentTempo() {
  return VOICE_TEMPOS[currentTempoIdx];
}

export function cycleTempo() {
  currentTempoIdx = (currentTempoIdx + 1) % VOICE_TEMPOS.length;
  const tempo = VOICE_TEMPOS[currentTempoIdx];
  const tempoLabel = document.getElementById('voice-speed-val');
  if (tempoLabel) tempoLabel.textContent = tempo.label;
  showToast(`Tempo resitasi: ${tempo.label}`);

  if (isSpeaking) {
    stopAudio();
    setTimeout(() => {
      const playBtn = document.getElementById('btn-play-audio');
      if (playBtn) playBtn.click();
    }, 120);
  }
  return tempo;
}

function clearKeepAlive() {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}

export function stopAudio() {
  clearKeepAlive();
  isPreparing = false;
  isSpeaking = false;
  currentUtterance = null;

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
  }

  const audioLabel = document.getElementById('audio-btn-label');
  const speakerIcon = document.getElementById('audio-icon-speaker');
  const stopIcon = document.getElementById('audio-icon-stop');
  const waveContainer = document.getElementById('audio-wave-container');

  if (audioLabel) audioLabel.textContent = 'Putar Resitasi Suara';
  if (speakerIcon) speakerIcon.classList.remove('hidden');
  if (stopIcon) stopIcon.classList.add('hidden');
  if (waveContainer) {
    waveContainer.classList.remove('flex');
    waveContainer.classList.add('hidden');
  }
}

export function sanitizeSpeechText(text) {
  if (!text) return '';
  return text
    // Strip Brahmic & Indic script Unicode blocks (Javanese, Balinese, Sundanese, Batak, Bugis, Kawi, Devanagari)
    .replace(/[\uA980-\uA9DF\u1B00-\u1B7F\u1B80-\u1BBF\u1BC0-\u1BFF\u1A00-\u1A1F\u{11F00}-\u{11F5F}\u0900-\u097F]/gu, '')
    // Remove formatting punctuation that disrupts speech cadence
    .replace(/[«»"“”'']/g, '')
    // Consolidate whitespaces
    .replace(/\s+/g, ' ')
    .trim();
}

export function playAudio(textToSpeak) {
  // If already actively speaking or audio is playing in browser, clicking toggles stop
  const isBrowserSpeaking = typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking;
  if (isSpeaking || isBrowserSpeaking) {
    stopAudio();
    return;
  }

  // Prevent double-triggering while audio engine is warming up
  if (isPreparing) {
    return;
  }

  if (!('speechSynthesis' in window)) {
    showToast('Peramban tidak mendukung Web Speech API');
    return;
  }

  const rawText = textToSpeak || (document.getElementById('result-translated-text') ? document.getElementById('result-translated-text').textContent.trim() : '');
  const text = sanitizeSpeechText(rawText);
  if (!text) {
    showToast('Tidak ada teks untuk diresitasikan');
    return;
  }

  isPreparing = true;

  const audioLabel = document.getElementById('audio-btn-label');
  const speakerIcon = document.getElementById('audio-icon-speaker');
  const stopIcon = document.getElementById('audio-icon-stop');
  const waveContainer = document.getElementById('audio-wave-container');

  // Instant tactile UI feedback so the user knows audio is loading immediately
  if (audioLabel) audioLabel.textContent = 'Memulai suara…';

  const utt = new SpeechSynthesisUtterance(text);
  currentUtterance = utt; // Retain reference in module scope to prevent V8 GC bug
  utt.lang = 'id-ID';
  utt.rate = VOICE_TEMPOS[currentTempoIdx].rate;
  utt.pitch = 0.98;

  // Select best Indonesian voice if available
  try {
    if (!cachedVoices.length) {
      cachedVoices = window.speechSynthesis.getVoices() || [];
    }
    const idVoice = cachedVoices.find(v => v.lang === 'id-ID' || v.lang === 'id_ID' || (v.lang && v.lang.toLowerCase().startsWith('id')));
    if (idVoice) {
      utt.voice = idVoice;
    }
  } catch (_) {}

  utt.onstart = () => {
    isPreparing = false;
    isSpeaking = true;
    if (audioLabel) audioLabel.textContent = 'Meresitasikan Naskah…';
    if (speakerIcon) speakerIcon.classList.add('hidden');
    if (stopIcon) stopIcon.classList.remove('hidden');
    if (waveContainer) {
      waveContainer.classList.remove('hidden');
      waveContainer.classList.add('flex');
    }

    // Android Chrome Keep-Alive: prevents pause after 15s
    clearKeepAlive();
    keepAliveTimer = setInterval(() => {
      if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else {
        clearKeepAlive();
      }
    }, 9000);
  };

  utt.onend = () => {
    stopAudio();
  };

  utt.onerror = (e) => {
    console.warn('SpeechSynthesisUtterance event error:', e);
    stopAudio();
  };

  // Safe Android Chrome execution: cancel any stalled tasks, resume audio context, then speak
  try {
    window.speechSynthesis.cancel();
  } catch (_) {}

  setTimeout(() => {
    try {
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utt);
    } catch (err) {
      console.warn('SpeechSynthesis.speak failed:', err);
      stopAudio();
    }
  }, 50);
}
