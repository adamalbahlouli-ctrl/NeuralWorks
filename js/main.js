/**
 * NeuralWorks — Main Application Script
 * Navigation, settings panel, scroll reveal, contact form, toast notifications
 */

(function () {
  'use strict';

  // ============================================================
  // UTILITIES
  // ============================================================
  function $(selector, context) {
    return (context || document).querySelector(selector);
  }

  function $$(selector, context) {
    return Array.from((context || document).querySelectorAll(selector));
  }

  function showToast(message, type, duration) {
    type = type || 'success';
    duration = duration || 4000;
    var container = document.getElementById('toast-container');
    if (!container) return;

    var icon = type === 'success' ? '✅' : '❌';
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML = '<span>' + icon + '</span> <span>' + message + '</span>';
    toast.setAttribute('role', 'alert');
    container.appendChild(toast);

    setTimeout(function () {
      toast.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(function () { toast.remove(); }, 300);
    }, duration);
  }

  // ============================================================
  // NAVBAR
  // ============================================================
  function initNavbar() {
    var navbar    = document.getElementById('navbar');
    var hamburger = document.getElementById('hamburger');
    var drawer    = document.getElementById('nav-drawer');

    if (!navbar) return;

    // Scroll effect
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          navbar.classList.toggle('scrolled', window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Hamburger toggle
    if (hamburger && drawer) {
      hamburger.addEventListener('click', function () {
        var isOpen = drawer.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
      });

      // Close drawer when a link is clicked
      $$('.nav-link', drawer).forEach(function (link) {
        link.addEventListener('click', function () {
          drawer.classList.remove('open');
          hamburger.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
        });
      });

      // Close on outside click
      document.addEventListener('click', function (e) {
        if (!navbar.contains(e.target) && !drawer.contains(e.target)) {
          drawer.classList.remove('open');
          hamburger.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Active nav link on scroll
    var sections = $$('section[id]');
    var navLinks = $$('.nav-link[href^="#"]');

    function updateActiveLink() {
      var scrollY = window.scrollY + 120;
      var active = '';
      sections.forEach(function (section) {
        if (scrollY >= section.offsetTop) {
          active = '#' + section.id;
        }
      });
      navLinks.forEach(function (link) {
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
    var overlay  = document.getElementById('settings-overlay');
    var panel    = document.getElementById('settings-panel');
    var closeBtn = document.getElementById('settings-close');

    // Collect ALL trigger buttons (navbar + drawer)
    var triggers = [
      document.getElementById('settings-trigger'),
      document.getElementById('drawer-settings')
    ].filter(Boolean);

    if (!overlay || !panel) {
      console.warn('[NeuralWorks] Settings panel elements not found.');
      return;
    }

    function openSettings() {
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }

    function closeSettings() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    triggers.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        openSettings();
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeSettings);
    }

    overlay.addEventListener('click', closeSettings);

    // Keyboard escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('open')) {
        closeSettings();
      }
    });

    // Trap focus inside panel
    panel.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var focusable = $$('button, a, input, select, textarea', panel)
        .filter(function (el) { return !el.disabled; });
      if (focusable.length === 0) return;
      var first = focusable[0];
      var last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  // ============================================================
  // SCROLL REVEAL
  // ============================================================
  function initScrollReveal() {
    var elements = $$('.reveal');
    if (elements.length === 0) return;

    if (typeof IntersectionObserver === 'undefined') {
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px 0px 0px'
    });

    elements.forEach(function (el) { observer.observe(el); });

    // Fallback: after 1.5s force-show all remaining hidden reveals
    // (handles cases where IntersectionObserver misses off-screen elements)
    setTimeout(function () {
      elements.forEach(function (el) { el.classList.add('visible'); });
    }, 1500);
  }

  // ============================================================
  // CONTACT FORM — EmailJS Integration
  // ============================================================
  var EMAILJS_PUBLIC_KEY  = 'LQnmFTXdf1e3jfTU0';
  var EMAILJS_SERVICE_ID  = 'service_AdamNoxtary20085';
  var EMAILJS_TEMPLATE_ID = 'template_79xyy3w';

  function initEmailJS() {
    if (typeof emailjs === 'undefined') {
      console.warn('[NeuralWorks] EmailJS library not loaded.');
      return;
    }
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  function initContactForm() {
    var form      = document.getElementById('contact-form');
    var submitBtn = document.getElementById('contact-submit');
    var success   = document.getElementById('form-success');
    var errorBox  = document.getElementById('form-error');

    if (!form) return;

    var SUBMIT_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';

    function showSuccess() {
      if (success)  { success.style.display  = 'block'; }
      if (errorBox) { errorBox.style.display  = 'none';  }
    }

    function showError() {
      if (errorBox) { errorBox.style.display  = 'block'; }
      if (success)  { success.style.display   = 'none';  }
    }

    function hideMessages() {
      if (success)  success.style.display  = 'none';
      if (errorBox) errorBox.style.display = 'none';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      hideMessages();

      var name    = form.elements['name']    ? form.elements['name'].value.trim()    : '';
      var email   = form.elements['email']   ? form.elements['email'].value.trim()   : '';
      var service = form.elements['service'] ? form.elements['service'].value        : '';
      var message = form.elements['message'] ? form.elements['message'].value.trim() : '';

      // Validation
      if (!name || !email || !message) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('Please enter a valid email address.', 'error');
        return;
      }

      // Loading state
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      // EmailJS not loaded check
      if (typeof emailjs === 'undefined') {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send Message ' + SUBMIT_ICON;
        showError();
        showToast('Email service unavailable. Please try again later.', 'error');
        return;
      }

      var templateParams = {
        name:    name,
        email:   email,
        service: service || 'Not specified',
        message: message
      };

      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(function (result) {
          console.log('[NeuralWorks] Email sent:', result);
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Send Message ' + SUBMIT_ICON;
          showSuccess();
          showToast("Message sent! We'll get back to you shortly.", 'success');
          form.reset();
          setTimeout(function () {
            if (success) success.style.display = 'none';
          }, 6000);
        })
        .catch(function (err) {
          console.error('[NeuralWorks] Email failed:', err);
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Send Message ' + SUBMIT_ICON;
          showError();
          showToast('Failed to send message. Please try again.', 'error');
        });
    });
  }

  // ============================================================
  // SMOOTH SCROLL
  // ============================================================
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var href   = anchor.getAttribute('href');
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          var offset = parseInt(
            getComputedStyle(document.documentElement).getPropertyValue('--nav-height'),
            10
          ) || 72;
          var top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });
  }

  // ============================================================
  // COUNTER ANIMATION
  // ============================================================
  function initCounters() {
    var stats = $$('.hero-stat-value');
    if (stats.length === 0) return;

    if (typeof IntersectionObserver === 'undefined') {
      stats.forEach(function (el) {
        var target  = parseInt(el.getAttribute('data-count')) || 0;
        var suffix  = el.textContent.replace(/[0-9]/g, '').replace(String(target), '');
        el.textContent = target + suffix;
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el      = entry.target;
        var target  = parseInt(el.getAttribute('data-count')) || 0;
        var suffix  = el.textContent.replace(/[0-9]/g, '').replace(String(target), '');
        var current = 0;
        var step    = Math.ceil(target / 60);
        var timer   = setInterval(function () {
          current = Math.min(current + step, target);
          el.textContent = current + suffix;
          if (current >= target) clearInterval(timer);
        }, 16);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    stats.forEach(function (stat) { observer.observe(stat); });
  }

  // ============================================================
  // IMAGE LAZY LOAD WITH FADE-IN
  // ============================================================
  function initLazyImages() {
    if ('loading' in HTMLImageElement.prototype) return;

    var images = $$('img[loading="lazy"]');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          img.style.opacity = '1';
          observer.unobserve(img);
        }
      });
    });

    images.forEach(function (img) {
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.4s ease';
      img.addEventListener('load', function () { img.style.opacity = '1'; });
      observer.observe(img);
    });
  }

  // ============================================================
  // MAIN INIT
  // ============================================================
  function init() {
    var modules = [
      { name: 'EmailJS', fn: initEmailJS },
      { name: 'Navbar', fn: initNavbar },
      { name: 'Settings', fn: initSettings },
      { name: 'ScrollReveal', fn: initScrollReveal },
      { name: 'ContactForm', fn: initContactForm },
      { name: 'SmoothScroll', fn: initSmoothScroll },
      { name: 'Counters', fn: initCounters },
      { name: 'LazyImages', fn: initLazyImages }
    ];

    modules.forEach(function (mod) {
      try {
        mod.fn();
      } catch (err) {
        console.error('[NeuralWorks] Error initializing ' + mod.name + ':', err);
      }
    });

    // Global error handler for unhandled promise rejections
    window.addEventListener('unhandledrejection', function (event) {
      console.warn('[NeuralWorks] Unhandled rejection:', event.reason);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose utilities
  window.NW = { showToast: showToast };
})();
