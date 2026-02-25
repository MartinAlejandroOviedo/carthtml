const partsCache = new Map();
const CART_STORAGE_KEY = 'sport-cart-items';
let siteConfigCache = null;

async function loadPart(partName) {
  if (partsCache.has(partName)) {
    return partsCache.get(partName);
  }

  const response = await fetch(`/parts/${partName}.html`);
  if (!response.ok) {
    throw new Error(`No se pudo cargar /parts/${partName}.html`);
  }

  const html = await response.text();
  partsCache.set(partName, html);
  return html;
}

function normalizeWhatsappNumber(value) {
  return String(value || '')
    .replace(/\D+/g, '')
    .slice(0, 20);
}

async function fetchSiteConfig() {
  if (siteConfigCache) return siteConfigCache;
  try {
    const response = await fetch('/api/site-config');
    if (!response.ok) throw new Error('No se pudo cargar config de sitio.');
    const data = await response.json();
    siteConfigCache = {
      storeName: String(data?.storeName || 'SLStore').trim(),
      whatsappNumber: normalizeWhatsappNumber(data?.whatsappNumber || ''),
      socialInstagramUrl: String(data?.socialInstagramUrl || '').trim(),
      socialFacebookUrl: String(data?.socialFacebookUrl || '').trim(),
      socialYoutubeUrl: String(data?.socialYoutubeUrl || '').trim(),
      socialXUrl: String(data?.socialXUrl || '').trim()
    };
  } catch (_error) {
    siteConfigCache = {
      storeName: 'SLStore',
      whatsappNumber: '5491112345678',
      socialInstagramUrl: '',
      socialFacebookUrl: '',
      socialYoutubeUrl: '',
      socialXUrl: ''
    };
  }
  return siteConfigCache;
}

function hydrateFooterSocialLinks(config) {
  const map = {
    instagram: String(config?.socialInstagramUrl || '').trim(),
    facebook: String(config?.socialFacebookUrl || '').trim(),
    youtube: String(config?.socialYoutubeUrl || '').trim(),
    x: String(config?.socialXUrl || '').trim()
  };

  document.querySelectorAll('[data-social-link]').forEach((linkEl) => {
    const key = String(linkEl.dataset.socialLink || '').trim();
    const href = map[key];
    if (!href) {
      linkEl.classList.add('hidden');
      linkEl.removeAttribute('href');
      return;
    }
    linkEl.classList.remove('hidden');
    linkEl.href = href;
    linkEl.target = '_blank';
    linkEl.rel = 'noopener noreferrer';
  });
}

function hydrateStoreName(config) {
  const storeName = String(config?.storeName || '').trim() || 'SLStore';
  document.querySelectorAll('[data-store-name]').forEach((node) => {
    node.textContent = storeName;
  });
}

function injectFloatingWhatsappButton({ storeName, whatsappNumber }) {
  const normalizedNumber = normalizeWhatsappNumber(whatsappNumber) || '5491112345678';
  const existing = document.getElementById('floating-whatsapp-btn');
  if (existing) existing.remove();
  if (!normalizedNumber) return;

  const anchor = document.createElement('a');
  anchor.id = 'floating-whatsapp-btn';
  anchor.href = `https://wa.me/${normalizedNumber}`;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  anchor.className = 'has-tooltip';
  anchor.style.position = 'fixed';
  anchor.style.zIndex = '60';
  anchor.style.display = 'inline-flex';
  anchor.style.alignItems = 'center';
  anchor.style.justifyContent = 'center';
  anchor.style.width = '56px';
  anchor.style.height = '56px';
  anchor.style.borderRadius = '9999px';
  anchor.style.border = '1px solid rgba(110, 231, 183, 0.55)';
  anchor.style.backgroundColor = '#25D366';
  anchor.style.color = '#ffffff';
  anchor.style.boxShadow = '0 18px 34px rgba(6, 95, 70, 0.45)';
  anchor.style.bottom = '16px';
  anchor.style.right = '16px';
  anchor.addEventListener('mouseenter', () => {
    anchor.style.backgroundColor = '#1ebe5d';
  });
  anchor.addEventListener('mouseleave', () => {
    anchor.style.backgroundColor = '#25D366';
  });
  anchor.setAttribute('aria-label', `Contactar por WhatsApp a ${storeName || 'la tienda'}`);
  anchor.setAttribute('data-tooltip', 'WhatsApp');
  anchor.innerHTML = '<span class="lucide h-7 w-7" data-lucide="message-circle"></span>';
  document.body.appendChild(anchor);
}

export async function injectLayout() {
  const headerRoot = document.getElementById('site-header');
  const footerRoot = document.getElementById('site-footer');
  const filtersRoot = document.getElementById('filters-root');

  const tasks = [];

  if (headerRoot) {
    tasks.push(
      loadPart('header').then((html) => {
        headerRoot.innerHTML = html;
      })
    );
  }

  if (footerRoot) {
    tasks.push(
      loadPart('footer').then((html) => {
        footerRoot.innerHTML = html;
      })
    );
  }

  if (filtersRoot) {
    tasks.push(
      loadPart('filters-panel').then((html) => {
        filtersRoot.innerHTML = html;
      })
    );
  }

  await Promise.all(tasks);
  const siteConfig = await fetchSiteConfig();
  hydrateStoreName(siteConfig);
  injectFloatingWhatsappButton(siteConfig);
  hydrateFooterSocialLinks(siteConfig);

  const cartToggle = document.getElementById('cart-toggle');
  const cartCount = document.getElementById('cart-count');
  const hasCartPanel = Boolean(document.getElementById('cart-panel'));

  if (cartCount) {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      const items = raw ? JSON.parse(raw) : [];
      const qty = Array.isArray(items) ? items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) : 0;
      cartCount.textContent = String(qty);
    } catch {
      cartCount.textContent = '0';
    }
  }

  if (cartToggle && !hasCartPanel) {
    cartToggle.addEventListener('click', () => {
      window.location.href = '/cart.html';
    });
  }

  if (window.lucide?.createIcons) {
    window.lucide.createIcons();
  }
}
