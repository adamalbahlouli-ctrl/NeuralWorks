/**
 * NeuralWorks — Theme Manager
 * Handles dark/light mode with localStorage persistence
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'nw-theme';

  // ---- Safe LocalStorage helpers ----
  function safeGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function safeSet(key, val) {
    try {
      localStorage.setItem(key, val);
    } catch (e) {
      // Fail silently
    }
  }

  // ---- Apply theme immediately (before paint to avoid flash) ----
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    safeSet(STORAGE_KEY, theme);

    // Update settings panel buttons
    const darkBtn  = document.getElementById('theme-dark');
    const lightBtn = document.getElementById('theme-light');
    if (darkBtn && lightBtn) {
      if (theme === 'dark') {
        darkBtn.classList.add('active');
        darkBtn.setAttribute('aria-checked', 'true');
        lightBtn.classList.remove('active');
        lightBtn.setAttribute('aria-checked', 'false');
      } else {
        lightBtn.classList.add('active');
        lightBtn.setAttribute('aria-checked', 'true');
        darkBtn.classList.remove('active');
        darkBtn.setAttribute('aria-checked', 'false');
      }
    }
  }

  // ---- Load saved theme ----
  function loadTheme() {
    const saved = safeGet(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    // Respect system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  // ---- Init ----
  function initButtons() {
    const darkBtn  = document.getElementById('theme-dark');
    const lightBtn = document.getElementById('theme-light');

    if (darkBtn) {
      darkBtn.addEventListener('click', () => applyTheme('dark'));
    }
    if (lightBtn) {
      lightBtn.addEventListener('click', () => applyTheme('light'));
    }

    // Re-apply to sync button states
    applyTheme(loadTheme());
  }

  function init() {
    applyTheme(loadTheme());

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initButtons);
    } else {
      initButtons();
    }
  }

  // Apply instantly (runs before DOMContentLoaded)
  const currentTheme = loadTheme();
  document.documentElement.setAttribute('data-theme', currentTheme);

  init();

  // Expose to global for other modules
  window.NWTheme = { applyTheme, loadTheme };
})();
