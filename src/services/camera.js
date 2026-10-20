/**
 * Camera Lifecycle & Hardware Control Service for LONTAR.ai
 */

import { showElement, hideElement, showToast } from '../utils/epigraphy.js';

let cameraStream = null;
let facingMode = 'environment';
let flashActive = false;

export function isCameraActive() {
  return !!cameraStream;
}

export function getFacingMode() {
  return facingMode;
}

export function isFlashActive() {
  return flashActive;
}

export async function startCamera() {
  const videoEl = document.getElementById('camera-feed');
  const fallbackEl = document.getElementById('camera-fallback');
  const liveBadge = document.getElementById('camera-live-badge');
  const deniedNotice = document.getElementById('camera-denied-notice');
  const modeLabel = document.getElementById('scan-mode-label');
  const errorMsg = document.getElementById('scan-error-msg');
  if (errorMsg) hideElement(errorMsg);

  stopCamera();

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.warn('getUserMedia tidak didukung pada browser ini');
    showElement(fallbackEl);
    if (videoEl) videoEl.classList.add('hidden');
    if (liveBadge) liveBadge.classList.add('hidden');
    if (modeLabel) modeLabel.textContent = 'Simulasi Naskah (Kamera Tidak Tersedia)';
    return null;
  }

  try {
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
    } catch (_) {
      // Fallback constraint for laptop webcams or restricted browser environments
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
    }

    if (videoEl) {
      videoEl.srcObject = cameraStream;
      videoEl.classList.remove('hidden');
      try {
        await videoEl.play();
      } catch (playErr) {
        console.warn('video.play() warning:', playErr);
      }
    }

    if (fallbackEl) fallbackEl.classList.add('hidden');
    if (liveBadge) {
      liveBadge.classList.remove('hidden');
      liveBadge.classList.add('flex');
    }
    if (deniedNotice) deniedNotice.classList.add('hidden');
    if (modeLabel) modeLabel.textContent = 'Kamera Aktif · Gemini Vision';

    return cameraStream;
  } catch (err) {
    console.warn('Akses kamera ditolak atau gagal:', err);
    showElement(fallbackEl);
    if (videoEl) videoEl.classList.add('hidden');
    if (liveBadge) liveBadge.classList.add('hidden');
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      showElement(deniedNotice);
    }
    if (modeLabel) modeLabel.textContent = 'Mode Uji Naskah Kurasi';
    return null;
  }
}

export function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
  const videoEl = document.getElementById('camera-feed');
  if (videoEl) videoEl.srcObject = null;
  const liveBadge = document.getElementById('camera-live-badge');
  if (liveBadge) liveBadge.classList.add('hidden');
}

export async function toggleFlash(buttonEl) {
  flashActive = !flashActive;
  if (buttonEl) {
    buttonEl.classList.toggle('text-amber-400', flashActive);
    buttonEl.classList.toggle('border-amber-400/80', flashActive);
    buttonEl.classList.toggle('bg-amber-400/20', flashActive);
  }

  if (cameraStream) {
    const track = cameraStream.getVideoTracks()[0];
    if (track && track.getCapabilities && track.getCapabilities().torch) {
      try {
        await track.applyConstraints({ advanced: [{ torch: flashActive }] });
      } catch (_) {}
    }
  }
  showToast(flashActive ? 'Lampu sorot aktif' : 'Lampu sorot mati');
  return flashActive;
}

export async function switchCamera() {
  facingMode = facingMode === 'environment' ? 'user' : 'environment';
  showToast(facingMode === 'environment' ? 'Kamera Belakang' : 'Kamera Depan');
  await startCamera();
  return facingMode;
}

export function captureSnapshot(video, canvas) {
  if (!video || !canvas) return null;
  const w = video.videoWidth || 640;
  const h = video.videoHeight || 480;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, w, h);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  const base64 = dataUrl.replace(/^data:image\/jpeg;base64,/, '');
  return { dataUrl, base64, mimeType: 'image/jpeg' };
}
