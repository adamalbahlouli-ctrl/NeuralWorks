/**
 * NeuralWorks — Services Loader
 * Dynamically fetches and renders service cards from data/services.json
 * All product data is managed exclusively through the JSON file.
 */

(function () {
  'use strict';

  const SERVICES_URL = 'data/services.json';
  const PRODUCT_PAGE = 'Product.html';

  // ---- Category Icon Map ----
  const CATEGORY_ICONS = {
    'Web Development':    '🌐',
    'Writing':            '✍️',
    'Mobile Development': '📱',
    'Design':             '🎨',
    'Maintenance':        '🔧',
    'Support':            '🛡️',
    'Gaming':             '🎮',
    'Music':              '🎵',
    'Default':            '⚡',
  };

  // ---- Render skeleton loading cards ----
  function renderSkeletons(grid, count = 6) {
    grid.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const card = document.createElement('article');
      card.className = 'service-card';
      card.setAttribute('aria-busy', 'true');
      card.setAttribute('aria-label', 'Loading service…');
      card.innerHTML = `
        <div class="service-card-image">
          <div class="skeleton" style="width:100%;height:100%;"></div>
        </div>
        <div class="service-card-body">
          <div class="skeleton" style="height:14px;width:60%;margin-bottom:12px;"></div>
          <div class="skeleton" style="height:20px;width:85%;margin-bottom:10px;"></div>
          <div class="skeleton" style="height:14px;width:100%;margin-bottom:8px;"></div>
          <div class="skeleton" style="height:14px;width:80%;margin-bottom:24px;"></div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div class="skeleton" style="height:14px;width:35%;"></div>
            <div class="skeleton" style="height:36px;width:110px;border-radius:9999px;"></div>
          </div>
        </div>
      `;
      grid.appendChild(card);
    }
  }

  // ---- Build a service card element ----
  function buildServiceCard(service) {
    const card = document.createElement('article');
    card.className = 'service-card reveal';
    card.setAttribute('data-id', service.id);
    card.setAttribute('data-slug', service.slug);
    card.setAttribute('aria-label', service.title);

    const categoryIcon = CATEGORY_ICONS[service.category] || CATEGORY_ICONS['Default'];

    const priceHTML = service.price
      ? `<div class="service-card-price">From <span>$${escapeHtml(service.price)}</span></div>`
      : `<div class="service-card-price" style="color:transparent;">—</div>`;

    const badgeHTML = service.badge
      ? `<span class="service-card-badge">${escapeHtml(service.badge)}</span>`
      : '';

    card.innerHTML = `
      <div class="service-card-image">
        <img
          src="${escapeHtml(service.image)}"
          alt="${escapeHtml(service.title)}"
          loading="lazy"
          width="600"
          height="338"
          onerror="this.src='https://via.placeholder.com/600x338/0a0f2e/6c63ff?text=NeuralWorks'"
        />
        ${badgeHTML}
      </div>
      <div class="service-card-body">
        <div class="service-card-category">
          <span aria-hidden="true">${categoryIcon}</span> ${escapeHtml(service.category || 'Service')}
        </div>
        <h3 class="service-card-title">${escapeHtml(service.title)}</h3>
        <p class="service-card-desc">${escapeHtml(service.description)}</p>
        <div class="service-card-footer">
          ${priceHTML}
          <button class="btn-order" data-slug="${escapeHtml(service.slug)}" aria-label="Order ${escapeHtml(service.title)}">
            Order Now
          </button>
        </div>
      </div>
    `;

    // Navigate to Product.html with slug as query param
    card.addEventListener('click', (e) => {
      // Allow button clicks to propagate
      navigateToProduct(service.slug);
    });

    return card;
  }

  // ---- Navigate to Product page ----
  function navigateToProduct(slug) {
    window.location.href = `${PRODUCT_PAGE}?service=${encodeURIComponent(slug)}`;
  }

  // ---- Render service cards with staggered reveal ----
  function renderServices(grid, services) {
    grid.innerHTML = '';

    if (!services || services.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-muted);">
          <p style="font-size:1.1rem;">No services available at the moment.</p>
        </div>
      `;
      return;
    }

    services.forEach((service, index) => {
      const card = buildServiceCard(service);
      // Stagger reveal delay
      const delay = Math.min(index * 0.08, 0.5);
      card.style.transitionDelay = `${delay}s`;
      grid.appendChild(card);
    });

    // Trigger reveal animations
    requestAnimationFrame(() => {
      const cards = grid.querySelectorAll('.reveal');
      cards.forEach(card => card.classList.add('visible'));
    });
  }

  // ---- Fetch from JSON ----
  async function fetchServices() {
    const response = await fetch(SERVICES_URL, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-cache',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Invalid services data format');
    return data;
  }

  // ---- Error state ----
  function renderError(grid, message) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px;">
        <div style="font-size:2.5rem;margin-bottom:16px;">⚠️</div>
        <p style="color:var(--text-muted);font-size:1rem;">
          Unable to load services. Please try again later.
        </p>
        <p style="color:var(--text-muted);font-size:0.8rem;margin-top:8px;opacity:0.6;">${escapeHtml(message)}</p>
        <button onclick="window.location.reload()" class="btn btn-outline btn-sm" style="margin-top:24px;">
          Retry
        </button>
      </div>
    `;
  }

  // ---- Main Init ----
  async function init() {
    const grid = document.getElementById('services-grid');
    if (!grid) return;

    renderSkeletons(grid, 9);

    try {
      const services = await fetchServices();
      // Small delay so skeletons are visible (better UX perception)
      setTimeout(() => renderServices(grid, services), 400);
    } catch (err) {
      console.error('[NeuralWorks] Services load error:', err);
      renderError(grid, err.message);
    }
  }

  // ---- Utility: escape HTML ----
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for reuse
  window.NWServices = { fetchServices, navigateToProduct };
})();
