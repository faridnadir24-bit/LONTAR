/**
 * Speech Synthesis Audio Studio for LONTAR.ai
 */

import { VOICE_TEMPOS } from '../data/manuscripts.js';
import { showToast } from '../utils/epigraphy.js';

let isSpeaking = false;
let currentTempoIdx = 0;

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
    const playBtn = document.getElementById('btn-play-audio');
    if (playBtn) playBtn.click();
  }
  return tempo;
}

export function stopAudio() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  isSpeaking = false;

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

export function playAudio(textToSpeak) {
  if (isSpeaking) {
    stopAudio();
    return;
  }

  if (!('speechSynthesis' in window)) {
    showToast('Peramban tidak mendukung Web Speech API');
    return;
  }

  const text = textToSpeak || (document.getElementById('result-translated-text') ? document.getElementById('result-translated-text').textContent.trim() : '');
  if (!text) return;

  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'id-ID';
  utt.rate = VOICE_TEMPOS[currentTempoIdx].rate;
  utt.pitch = 0.98;

  const audioLabel = document.getElementById('audio-btn-label');
  const speakerIcon = document.getElementById('audio-icon-speaker');
  const stopIcon = document.getElementById('audio-icon-stop');
  const waveContainer = document.getElementById('audio-wave-container');

  utt.onstart = () => {
    isSpeaking = true;
    if (audioLabel) audioLabel.textContent = 'Meresitasikan Naskah…';
    if (speakerIcon) speakerIcon.classList.add('hidden');
    if (stopIcon) stopIcon.classList.remove('hidden');
    if (waveContainer) {
      waveContainer.classList.remove('hidden');
      waveContainer.classList.add('flex');
    }
  };

  utt.onend = utt.onerror = () => stopAudio();

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utt);
}
