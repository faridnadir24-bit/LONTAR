/**
 * Minimalist Theme Engine (Clean Light Mode / Monochrome Dark Mode)
 */

const htmlEl = document.documentElement;

export function applyTheme(isDark) {
  htmlEl.classList.toggle('dark', isDark);
  const label = document.getElementById('theme-label');
  const toggleBtn = document.getElementById('theme-toggle');
  if (label) {
    label.textContent = isDark ? 'Terang' : 'Gelap';
  }
  if (toggleBtn) {
    toggleBtn.title = isDark ? 'Beralih ke Mode Putih (Terang)' : 'Beralih ke Mode Hitam-Putih (Gelap)';
  }
  try {
    localStorage.setItem('lontar_theme', isDark ? 'dark' : 'light');
  } catch (_) {}
}

export function toggleTheme() {
  applyTheme(!htmlEl.classList.contains('dark'));
}

export function initTheme() {
  const savedTheme = localStorage.getItem('lontar_theme');
  // Default is clean Light (Putih). Only dark if explicitly set by user.
  applyTheme(savedTheme === 'dark');

  const themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }
}
