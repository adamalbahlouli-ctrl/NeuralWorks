/**
 * NeuralWorks — Product Page Script
 * Reads ?service=slug from URL, fetches data/services.json,
 * and populates the Product.html layout dynamically.
 * Zero HTML/JS changes needed when services.json is updated.
 */

(function () {
  'use strict';

  const SERVICES_URL = 'data/services.json';

  // ---- Get slug from URL ----
  function getSlugFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('service') || '';
  }

  // ---- Find service by slug ----
  function findService(services, slug) {
    return services.find(s => s.slug === slug) || null;
  }

  // ---- Generate star rating HTML ----
  function buildStars(rating) {
    const r = parseFloat(rating) || 0;
    const fullStars = Math.floor(r);
    const halfStar  = r % 1 >= 0.5;
    const empty     = 5 - fullStars - (halfStar ? 1 : 0);
    let html = '';
    for (let i = 0; i < fullStars; i++) html += '★';
    if (halfStar) html += '✭';
    for (let i = 0; i < empty; i++) html += '☆';
    return html;
  }

  // ---- Render the product ----
  function renderProduct(service) {
    // Show content, hide loading/error
    document.getElementById('product-loading').style.display = 'none';
    document.getElementById('product-error').style.display = 'none';
    const content = document.getElementById('product-content');
    content.style.display = 'block';
    content.removeAttribute('aria-hidden');

    // Update page title and meta
    document.title = `${service.title} — NeuralWorks`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = service.description || service.title;

    // Breadcrumb
    const breadcrumbCurrent = document.getElementById('breadcrumb-current');
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = service.title;

    // Main Image
    const mainImg = document.getElementById('product-main-image');
    if (mainImg) {
      mainImg.src = service.image || '';
      mainImg.alt = service.title || '';
    }

    // Image Badges
    const badgesWrap = document.getElementById('product-image-badges');
    if (badgesWrap) {
      let badgesHTML = '';
      if (service.popular) {
        badgesHTML += `<span class="product-badge product-badge-popular">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          Popular
        </span>`;
      }
      if (service.recommended) {
        badgesHTML += `<span class="product-badge product-badge-recommended">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Recommended
        </span>`;
      }
      if (service.badge) {
        badgesHTML += `<span class="product-badge product-badge-label">${escapeHtml(service.badge)}</span>`;
      }
      badgesWrap.innerHTML = badgesHTML;
    }

    // Category
    const catEl = document.getElementById('product-category');
    if (catEl) catEl.textContent = service.category || 'Service';

    // Title & Subtitle
    setText('product-title', service.title);
    setText('product-subtitle', service.subtitle);

    // Rating
    const ratingRow = document.getElementById('product-rating-row');
    if (service.rating && ratingRow) {
      document.getElementById('product-stars').innerHTML = buildStars(service.rating);
      document.getElementById('product-stars').setAttribute('aria-label', `Rating: ${service.rating} out of 5`);
      setText('product-rating-value', service.rating);
      setText('product-reviews', service.reviews ? `(${service.reviews} reviews)` : '');
    } else if (ratingRow) {
      ratingRow.style.display = 'none';
    }

    // Price
    const priceBlock = document.getElementById('product-price-block');
    const priceEl    = document.getElementById('product-price');
    const discEl     = document.getElementById('product-discount');
    if (service.price && priceEl) {
      priceEl.textContent = `From $${service.price} ${service.currency || 'USD'}`;
    } else if (priceEl) {
      priceEl.textContent = 'Contact for Pricing';
    }
    if (service.discount && discEl) {
      discEl.textContent = `$${service.discount}`;
      discEl.style.display = 'block';
    }

    // Meta Grid
    const metaGrid = document.getElementById('product-meta-grid');
    if (metaGrid) {
      const metas = [];
      if (service.delivery_time) metas.push({ label: 'Delivery Time', value: service.delivery_time });
      if (service.support)       metas.push({ label: 'Support',        value: service.support });
      if (service.status)        metas.push({ label: 'Status',         value: capitalize(service.status) });
      if (service.category)      metas.push({ label: 'Category',       value: service.category });

      metaGrid.innerHTML = metas.map(m => `
        <div class="product-meta-item">
          <span class="product-meta-label">${escapeHtml(m.label)}</span>
          <span class="product-meta-value">${escapeHtml(m.value)}</span>
        </div>
      `).join('');
    }

    // Description
    setText('product-description', service.description);

    // Features list
    const featuresList = document.getElementById('product-features-list');
    if (featuresList && Array.isArray(service.features) && service.features.length) {
      featuresList.innerHTML = service.features.map(f => `
        <li class="product-feature-item">
          <span class="product-feature-check" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </span>
          ${escapeHtml(f)}
        </li>
      `).join('');
    } else {
      const panel = document.getElementById('product-features-panel');
      if (panel) panel.style.display = 'none';
    }

    // Technologies
    const techTags = document.getElementById('product-tech-tags');
    if (techTags && Array.isArray(service.technologies) && service.technologies.length) {
      techTags.innerHTML = service.technologies.map(t =>
        `<span class="tech-tag">${escapeHtml(t)}</span>`
      ).join('');
    } else {
      const panel = document.getElementById('product-tech-panel');
      if (panel) panel.style.display = 'none';
    }

    // Trigger scroll reveals
    requestAnimationFrame(() => {
      document.querySelectorAll('.reveal').forEach(el => {
        el.classList.add('visible');
      });
    });

    // Pre-select service in contact form dropdown based on current service
    const serviceSelect = document.getElementById('contact-service');
    if (serviceSelect && service.title) {
      let matched = false;
      // Try matching by option text (title) or value (slug)
      for (let opt of serviceSelect.options) {
        if (
          opt.value === service.slug ||
          opt.textContent.trim().toLowerCase() === service.title.toLowerCase()
        ) {
          opt.selected = true;
          matched = true;
          break;
        }
      }
      // Fallback: add a custom option pre-selected with the exact service title
      if (!matched) {
        const customOpt = document.createElement('option');
        customOpt.value = service.slug;
        customOpt.textContent = service.title;
        customOpt.selected = true;
        serviceSelect.insertBefore(customOpt, serviceSelect.options[1]);
      }
    }
  }

  // ---- Show error state ----
  function renderError() {
    document.getElementById('product-loading').style.display = 'none';
    document.getElementById('product-content').style.display = 'none';
    const err = document.getElementById('product-error');
    if (err) err.style.display = 'block';
  }

  // ---- Helpers ----
  function setText(id, text) {
    const el = document.getElementById(id);
    if (el && text) el.textContent = text;
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ---- Main ----
  async function init() {
    const slug = getSlugFromUrl();

    // If no slug, redirect to services
    if (!slug) {
      window.location.href = 'index.html#services';
      return;
    }

    try {
      const response = await fetch(SERVICES_URL, {
        headers: { 'Accept': 'application/json' },
        cache: 'no-cache',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const services = await response.json();
      if (!Array.isArray(services)) throw new Error('Invalid format');

      const service = findService(services, slug);
      if (!service) {
        renderError();
        return;
      }

      // Small delay for perception of loading
      setTimeout(() => renderProduct(service), 300);

    } catch (err) {
      console.error('[NeuralWorks] Product load error:', err);
      renderError();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
