/**
 * NeuralWorks — Product Page Script
 * Reads ?service=slug from URL, fetches data/services.json,
 * and populates the Product.html layout dynamically.
 * Zero HTML/JS changes needed when services.json is updated.
 */

(function () {
  'use strict';

  const SERVICES_URL = 'data/services.json';

  // ---- Inline fallback (used if fetch fails e.g. file:// protocol) ----
  const SERVICES_FALLBACK = [
    { id:'1', slug:'create-professional-website', title:'Create Professional Website', subtitle:'Modern, Responsive & High-Performance', description:'We craft custom, fully responsive websites built with modern technologies. From landing pages to complex web applications, every pixel is designed with your brand in mind. We focus on performance, SEO, and user experience to ensure your online presence stands out.', price:'', currency:'USD', category:'Web Development', image:'https://i.postimg.cc/ydL8G7V3/file-00000000d2c472468ac72117f2a0fe03.png', features:['Custom responsive design','SEO optimized structure','Fast loading performance','Cross-browser compatibility','Modern animations & effects','CMS integration available'], technologies:['HTML5','CSS3','JavaScript','React','Next.js'], delivery_time:'5–10 business days', support:'30 days post-delivery', rating:'4.9', reviews:'128', status:'available', badge:'Best Seller', popular:true, recommended:true },
    { id:'2', slug:'research-writing', title:'Research Writing', subtitle:'Academic & Technical Excellence', description:'Professional academic and technical research writing tailored to your needs. We produce well-structured, thoroughly researched, and properly cited content for reports, papers, theses, and technical documentation.', price:'10', currency:'USD', category:'Writing', image:'https://i.postimg.cc/Y9YxNyMm/file-00000000429871f4a6ff4446f56b4694.png', features:['Thorough research & sourcing','Proper academic citations','Plagiarism-free content','Multiple format support','Revision rounds included','On-time delivery'], technologies:['APA','MLA','Chicago','IEEE'], delivery_time:'3–7 business days', support:'Unlimited revisions for 14 days', rating:'4.8', reviews:'95', status:'available', badge:'Popular', popular:true, recommended:false },
    { id:'3', slug:'mobile-app-development', title:'Mobile App Development', subtitle:'Native & Cross-Platform Applications', description:'We build native and cross-platform mobile applications for iOS and Android that deliver smooth, engaging experiences. From ideation to deployment, our apps are built for performance, scalability, and user delight.', price:'', currency:'USD', category:'Mobile Development', image:'https://i.postimg.cc/tgVcfkpM/file-00000000217c71f495aa63acf81082ea.png', features:['iOS & Android support','Cross-platform development','Native performance','Push notifications','Offline functionality','App store submission'], technologies:['React Native','Flutter','Swift','Kotlin'], delivery_time:'2–6 weeks', support:'60 days post-launch', rating:'4.9', reviews:'74', status:'available', badge:'Premium', popular:false, recommended:true },
    { id:'4', slug:'professional-css-design', title:'Professional CSS Design', subtitle:'Modern UI Styling & Responsive Layouts', description:'Transform your web presence with modern UI styling and responsive CSS development. We create pixel-perfect designs that adapt beautifully across all devices and screen sizes, with smooth animations and premium visual polish.', price:'', currency:'USD', category:'Design', image:'https://i.postimg.cc/Bn5Lg917/file-00000000480072468e46a0d7d710e9c3.png', features:['Responsive layouts','CSS animations & transitions','Cross-browser support','Design system creation','Dark/Light theme support','Performance optimized'], technologies:['CSS3','SASS/SCSS','Tailwind','CSS Grid','Flexbox'], delivery_time:'2–5 business days', support:'14 days post-delivery', rating:'4.7', reviews:'88', status:'available', badge:'', popular:false, recommended:false },
    { id:'5', slug:'website-bug-fixing-security-audit', title:'Website Bug Fixing & Security Audit', subtitle:'Debugging, Optimization & Security', description:'Comprehensive bug fixing, performance optimization, and security auditing for your existing website. We identify vulnerabilities, fix critical issues, and implement best practices to keep your site fast, secure, and reliable.', price:'', currency:'USD', category:'Maintenance', image:'https://i.postimg.cc/vTmkPsB4/file-00000000a21871f4b7a0488050ef5378.png', features:['Full bug diagnosis & fixes','Security vulnerability scanning','Performance optimization','Code refactoring','SSL & HTTPS setup','Detailed audit report'], technologies:['OWASP','Lighthouse','Chrome DevTools','Wireshark'], delivery_time:'1–3 business days', support:'30 days guarantee', rating:'5.0', reviews:'52', status:'available', badge:'Guaranteed', popular:false, recommended:false },
    { id:'6', slug:'one-month-technical-support', title:'One Month Technical Support', subtitle:'30 Days of Continuous Assistance', description:'Get dedicated technical support for an entire month. Whether it\'s troubleshooting, updates, feature additions, or general assistance, our team is available to ensure your digital products run smoothly around the clock.', price:'', currency:'USD', category:'Support', image:'https://i.postimg.cc/YqYZbbqM/file-00000000302471f4af9cb0b42211d742.png', features:['30 days of continuous support','Priority response time','Bug fixes included','Minor feature updates','Progress reports','24/7 availability'], technologies:['Email','WhatsApp','Slack','GitHub'], delivery_time:'Starts immediately', support:'Full 30-day coverage', rating:'4.9', reviews:'41', status:'available', badge:'Value Pick', popular:false, recommended:false },
    { id:'7', slug:'game-mod-development', title:'Game Mod Development', subtitle:'Custom Modifications for Popular Games', description:'Bring new life to your favorite games with custom mods designed and developed by experts. From gameplay tweaks to full conversion mods, we create high-quality modifications that enhance the gaming experience.', price:'', currency:'USD', category:'Gaming', image:'https://i.postimg.cc/X7sdS0vr/file-0000000032fc71f484618328d0b129e5.png', features:['Custom gameplay mechanics','New assets & textures','Compatibility testing','Mod documentation','Installation support','Updates & patches'], technologies:['Lua','C++','Python','Unity','Unreal Engine'], delivery_time:'1–4 weeks', support:'14 days post-delivery', rating:'4.8', reviews:'63', status:'available', badge:'Unique', popular:false, recommended:false },
    { id:'8', slug:'professional-research-writing', title:'Professional Research Writing', subtitle:'Reports, Articles & Documentation', description:'Well-structured, meticulously written professional reports, articles, and technical documentation. Ideal for businesses, researchers, and organizations needing high-quality written content that communicates complex ideas clearly.', price:'', currency:'USD', category:'Writing', image:'https://i.postimg.cc/bJqwwsCf/file-0000000057c07246b01cdc58bc37148e.png', features:['Professional tone & structure','Data-driven insights','Executive summaries','Visual infographic support','Multiple delivery formats','Confidentiality guaranteed'], technologies:['Word','LaTeX','Google Docs','Notion'], delivery_time:'3–7 business days', support:'Revisions for 21 days', rating:'4.8', reviews:'79', status:'available', badge:'', popular:false, recommended:false },
    { id:'9', slug:'music-song-production', title:'Music & Song Production', subtitle:'AI-Assisted & Professional Music Creation', description:'Professional music and song production combining human artistry with AI-assisted tools. Whether you need a full track, jingle, podcast intro, or custom soundtrack, we deliver broadcast-quality audio that resonates.', price:'', currency:'USD', category:'Music', image:'https://i.postimg.cc/BbKTTgrV/file-00000000d1fc71f4b6e25ced763d0ae5.png', features:['Original compositions','AI-enhanced production','Professional mixing & mastering','Multiple genre support','Stems & project files included','Full commercial rights'], technologies:['Ableton Live','FL Studio','Suno AI','Logic Pro'], delivery_time:'3–10 business days', support:'2 revision rounds', rating:'4.9', reviews:'57', status:'available', badge:'Creative', popular:false, recommended:false }
  ];

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
    const loading = document.getElementById('product-loading');
    const content = document.getElementById('product-content');
    const err     = document.getElementById('product-error');
    if (loading) loading.style.display = 'none';
    if (content) content.style.display = 'none';
    if (err) err.style.display = 'block';

    // Still show the contact section at the bottom even on error
    requestAnimationFrame(() => {
      document.querySelectorAll('.reveal').forEach(el => {
        el.classList.add('visible');
      });
    });
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

    let services = null;

    try {
      const response = await fetch(SERVICES_URL, {
        headers: { 'Accept': 'application/json' },
        cache: 'no-cache',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Invalid format');
      services = data;
    } catch (err) {
      console.warn('[NeuralWorks] fetch failed, using inline fallback:', err.message);
      services = SERVICES_FALLBACK;
    }

    const service = findService(services, slug);
    if (!service) {
      renderError();
      return;
    }

    // Small delay for perception of loading
    setTimeout(() => renderProduct(service), 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
