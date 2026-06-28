/**
 * NeuralWorks — Main Application Script
 * Navigation, settings panel, scroll reveal, contact form, toast notifications
 */

(function () {
  'use strict';

  // ============================================================
  // UTILITIES
  // ============================================================
  function $(selector, context = document) {
    return context.querySelector(selector);
  }

  function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
  }

  function showToast(message, type = 'success', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icon = type === 'success' ? '✅' : '❌';
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    toast.setAttribute('role', 'alert');
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // ============================================================
  // NAVBAR
  // ============================================================
  function initNavbar() {
    const navbar    = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const drawer    = document.getElementById('nav-drawer');

    if (!navbar) return;

    // Scroll effect
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          navbar.classList.toggle('scrolled', window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Hamburger toggle
    if (hamburger && drawer) {
      hamburger.addEventListener('click', () => {
        const isOpen = drawer.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen.toString());
      });

      // Close drawer when a link is clicked
      $$('.nav-link', drawer).forEach(link => {
        link.addEventListener('click', () => {
          drawer.classList.remove('open');
          hamburger.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
        });
      });

      // Close on outside click
      document.addEventListener('click', e => {
        if (!navbar.contains(e.target) && !drawer.contains(e.target)) {
          drawer.classList.remove('open');
          hamburger.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Active nav link on scroll
    const sections = $$('section[id]');
    const navLinks = $$('.nav-link[href^="#"]');

    function updateActiveLink() {
      const scrollY = window.scrollY + 120;
      let active = '';
      sections.forEach(section => {
        if (scrollY >= section.offsetTop) {
          active = `#${section.id}`;
        }
      });
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === active);
      });
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });
    updateActiveLink();
  }

  // ============================================================
  // SETTINGS PANEL
  // ============================================================
  function initSettings() {
    const overlay   = document.getElementById('settings-overlay');
    const panel     = document.getElementById('settings-panel');
    const closeBtn  = document.getElementById('settings-close');
    const triggers  = [
      document.getElementById('settings-trigger'),
      document.getElementById('drawer-settings'),
    ].filter(Boolean);

    if (!overlay || !panel) return;

    function openSettings() {
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeBtn && closeBtn.focus();
    }

    function closeSettings() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    triggers.forEach(btn => btn.addEventListener('click', openSettings));
    if (closeBtn) closeBtn.addEventListener('click', closeSettings);
    overlay.addEventListener('click', closeSettings);

    // Keyboard escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && panel.classList.contains('open')) {
        closeSettings();
      }
    });

    // Trap focus inside panel
    panel.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const focusable = $$('button, a, input, select, textarea', panel)
        .filter(el => !el.disabled);
      if (focusable.length === 0) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });
  }

  // ============================================================
  // SCROLL REVEAL
  // ============================================================
  function initScrollReveal() {
    const elements = $$('.reveal');
    if (elements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px',
    });

    elements.forEach(el => observer.observe(el));
  }

  // ============================================================
  // CONTACT FORM
  // ============================================================
  function initContactForm() {
    const form      = document.getElementById('contact-form');
    const submitBtn = document.getElementById('contact-submit');
    const success   = document.getElementById('form-success');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name    = form.name.value.trim();
      const email   = form.email.value.trim();
      const message = form.message.value.trim();

      // Basic validation
      if (!name || !email || !message) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('Please enter a valid email address.', 'error');
        return;
      }

      // Simulate sending
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      await new Promise(resolve => setTimeout(resolve, 1200));

      submitBtn.disabled = false;
      submitBtn.innerHTML = `Send Message <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;

      if (success) {
        success.style.display = 'block';
        setTimeout(() => { success.style.display = 'none'; }, 5000);
      }

      showToast('Message sent! We\'ll get back to you shortly.', 'success');
      form.reset();
    });
  }

  // ============================================================
  // SMOOTH SCROLL
  // ============================================================
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', e => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          e.preventDefault();
          const offset = parseInt(getComputedStyle(document.documentElement)
            .getPropertyValue('--nav-height'), 10) || 72;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  // ============================================================
  // COUNTER ANIMATION
  // ============================================================
  function initCounters() {
    const stats = $$('.hero-stat-value');
    if (stats.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el      = entry.target;
        const target  = parseInt(el.getAttribute('data-count')) || 0;
        const suffix  = el.textContent.replace(/[0-9]/g, '').replace(target.toString(), '');
        let current   = 0;
        const step    = Math.ceil(target / 60);
        const timer   = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = current + suffix;
          if (current >= target) clearInterval(timer);
        }, 16);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));
  }

  // ============================================================
  // IMAGE LAZY LOAD WITH FADE-IN
  // ============================================================
  function initLazyImages() {
    if ('loading' in HTMLImageElement.prototype) return; // native lazy loading available

    const images = $$('img[loading="lazy"]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          img.style.opacity = '1';
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => {
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.4s ease';
      img.addEventListener('load', () => { img.style.opacity = '1'; });
      observer.observe(img);
    });
  }

  // ============================================================
  // MAIN INIT
  // ============================================================
  function init() {
    initNavbar();
    initSettings();
    initScrollReveal();
    initContactForm();
    initSmoothScroll();
    initCounters();
    initLazyImages();

    // Global error handler for unhandled promise rejections
    window.addEventListener('unhandledrejection', event => {
      console.warn('[NeuralWorks] Unhandled rejection:', event.reason);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose utilities
  window.NW = { showToast };
})();
