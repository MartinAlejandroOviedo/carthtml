const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const { GOOGLE_2026_DEFAULTS, normalizeGoogle2026Text } = require('../mod/google-2026');
const { SEO_IMAGES_DEFAULTS, normalizeSeoImagesText } = require('../mod/seo-images');
const { SEO_TECH_FILES_DEFAULTS, normalizeSeoTechFileText } = require('../mod/seo-tech-files');

const dbPath = path.join(__dirname, '..', 'data', 'store.sqlite');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new sqlite3.Database(dbPath);
db.serialize(() => {
  db.run('PRAGMA journal_mode=WAL;');
  db.run('PRAGMA synchronous=NORMAL;');
  db.run('PRAGMA busy_timeout=5000;');
  db.run('PRAGMA foreign_keys=ON;');
});
const UPLOADS_ROOT = path.join(__dirname, '..', 'public', 'uploads');

const DEFAULT_CATEGORIES = [
  'Fútbol',
  'Entrenamiento',
  'Running',
  'Indumentaria',
  'Calzado',
  'Accesorios',
  'Bolsos y mochilas'
];
const DEFAULT_HERO_SLIDES = [
  {
    url: 'https://picsum.photos/seed/slstore-hero-1/1600/900',
    altText: 'Jugador de futbol con camiseta oficial',
    title: 'Equipate para tu proximo partido',
    description: 'Elegi productos, armamos tu pedido y lo enviamos directo por WhatsApp con detalle completo.',
    sortOrder: 0
  },
  {
    url: 'https://picsum.photos/seed/slstore-hero-2/1600/900',
    altText: 'Indumentaria deportiva para entrenar y competir',
    title: 'Nuevos ingresos toda la semana',
    description: 'Remeras, shorts y accesorios listos para salir a la cancha.',
    sortOrder: 1
  },
  {
    url: 'https://picsum.photos/seed/slstore-hero-3/1600/900',
    altText: 'Ofertas destacadas para equipamiento deportivo',
    title: 'Promos y envios a todo el pais',
    description: 'Compra rapido y recibi con Correo Argentino en tu ciudad.',
    sortOrder: 2
  }
];

const HELP_PAGE_TITLE = 'Como pedir de forma rapida';
const SECURITY_PAGE_TITLE = 'Seguridad y anti scrape';
const DEFAULT_ADMIN_USER = {
  username: 'admin',
  password: 'admin123',
  fullName: 'Administrador SLStore',
  role: 'admin'
};
const DEFAULT_STORE_NAME = process.env.STORE_NAME || 'SLStore';
const DEFAULT_WHATSAPP_NUMBER = String(process.env.WHATSAPP_NUMBER || '5491112345678').replace(/\D+/g, '');
const DEFAULT_TEMPLATE_HEADING_FONT = 'space-grotesk';
const DEFAULT_TEMPLATE_BODY_FONT = 'inter';
const DEFAULT_TEMPLATE_HEADING_COLOR = '#ffffff';
const DEFAULT_TEMPLATE_BODY_COLOR = '#e2e8f0';
const DEFAULT_TEMPLATE_HEADING_SCALE = 1;
const DEFAULT_TEMPLATE_HEADING_SIZE_PX = 32;
const DEFAULT_TEMPLATE_BODY_SIZE_PX = 16;
const DEFAULT_FOOTER_CONTACT_EMAIL = 'ventas@slstore.com';
const DEFAULT_FOOTER_CONTACT_HOURS = 'Horario: Lun a Vie 9:00 - 18:00';
const DEFAULT_FOOTER_LOCATION_LINE1 = 'CABA, Buenos Aires, Argentina';
const DEFAULT_FOOTER_LOCATION_LINE2 = 'Envios nacionales con Correo Argentino';
const TEMPLATE_FONT_CHOICES = new Set([
  'space-grotesk',
  'barlow-condensed',
  'bebas-neue',
  'oswald',
  'playfair-display',
  'raleway',
  'inter',
  'manrope',
  'roboto',
  'lato',
  'montserrat',
  'poppins',
  'nunito',
  'source-sans-3'
]);
const SHIPPING_FLAT_ARS = 9500;
const BCRYPT_ROUNDS = 12;

function buildAbsoluteUrl(baseUrl, resourcePath) {
  const rawBase = String(baseUrl || '').trim().replace(/\/+$/, '');
  const rawPath = String(resourcePath || '').trim();
  if (!rawPath) return '';
  if (/^https?:\/\//i.test(rawPath)) return rawPath;
  if (!rawBase) return rawPath;
  const normalizedPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  return `${rawBase}${normalizedPath}`;
}
const HELP_PAGE_CONTENT_HTML = `
<section class="mx-auto max-w-6xl px-4 pt-8">
  <div class="rounded-3xl border border-white/10 bg-slate-900/75 p-5 shadow-2xl shadow-slate-950/60">
    <p class="font-display text-4xl uppercase leading-none text-white sm:text-5xl">${HELP_PAGE_TITLE}</p>
    <p class="mt-3 max-w-3xl text-sm text-slate-300">
      Esta pagina no procesa compras. Te ayuda a preparar un pedido claro para acelerar la atencion entre cliente y vendedor.
      La confirmacion final se realiza por WhatsApp con el vendedor.
    </p>
  </div>
</section>

<section class="mx-auto max-w-6xl px-4 py-6">
  <div class="grid gap-4 md:grid-cols-2">
    <article class="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <p class="font-display text-2xl uppercase text-white">1. Filtra y elige</p>
      <ul class="mt-3 space-y-2 text-sm text-slate-300">
        <li>Usa filtros por categoria y orden por precio para encontrar rapido.</li>
        <li>Entra al detalle del producto para revisar variantes.</li>
      </ul>
    </article>
    <article class="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <p class="font-display text-2xl uppercase text-white">2. Completa variantes</p>
      <ul class="mt-3 space-y-2 text-sm text-slate-300">
        <li>Define color, talle y cantidad antes de agregar al carrito.</li>
        <li>Agrega notas utiles (estampado, referencia, preferencia de entrega).</li>
      </ul>
    </article>
    <article class="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <p class="font-display text-2xl uppercase text-white">3. Revisa el carrito</p>
      <ul class="mt-3 space-y-2 text-sm text-slate-300">
        <li>Verifica productos, subtotales y costo fijo de envio.</li>
        <li>Corrige cantidades antes de continuar.</li>
      </ul>
    </article>
    <article class="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <p class="font-display text-2xl uppercase text-white">4. Cierra por WhatsApp</p>
      <ul class="mt-3 space-y-2 text-sm text-slate-300">
        <li>Completa nombre, telefono y direccion para generar el pedido.</li>
        <li>El vendedor valida stock, tiempos y confirma la compra por WhatsApp.</li>
      </ul>
    </article>
  </div>
</section>

<section class="mx-auto max-w-6xl px-4 pb-10">
  <div class="rounded-2xl border border-sky-300/25 bg-sky-500/10 p-4 text-sm text-sky-100">
    <p class="font-semibold">Importante:</p>
    <p class="mt-1">
      El sitio funciona como asistente de armado de pedido. La operacion comercial se confirma unicamente por WhatsApp con el vendedor.
    </p>
  </div>
</section>
`;

const SECURITY_PAGE_CONTENT_HTML = `
<section class="mx-auto max-w-6xl px-4 pt-8">
  <div class="rounded-3xl border border-white/10 bg-slate-900/75 p-5 shadow-2xl shadow-slate-950/60">
    <p class="font-display text-4xl uppercase leading-none text-white sm:text-5xl">${SECURITY_PAGE_TITLE}</p>
    <p class="mt-3 max-w-4xl text-sm text-slate-300">
      Guia operativa para entender tecnicas anti-scraping y preparar defensas en el sitio. Esta pagina es informativa.
    </p>
  </div>
</section>

<section class="mx-auto max-w-6xl px-4 py-6">
  <div data-security-tabs class="rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-xl shadow-slate-950/40">
    <div role="tablist" aria-label="Seguridad tabs" class="mb-4 flex flex-wrap gap-2">
      <button type="button" data-tab-target="anti-scrape" class="security-tab-btn rounded-xl border border-sky-300/60 bg-sky-500/25 px-3 py-2 text-sm text-white">Anti Scrape</button>
      <button type="button" data-tab-target="hardening" class="security-tab-btn rounded-xl border border-white/15 bg-slate-900/60 px-3 py-2 text-sm text-slate-200">Hardening</button>
      <button type="button" data-tab-target="deteccion" class="security-tab-btn rounded-xl border border-white/15 bg-slate-900/60 px-3 py-2 text-sm text-slate-200">Deteccion</button>
      <button type="button" data-tab-target="legal" class="security-tab-btn rounded-xl border border-white/15 bg-slate-900/60 px-3 py-2 text-sm text-slate-200">Legal</button>
    </div>

    <article data-tab-panel="anti-scrape" class="security-tab-panel space-y-4">
      <div class="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
        <p class="font-display text-2xl uppercase text-white">7 Anti-Scraping Techniques You Need to Know</p>
        <p class="mt-2 text-sm text-slate-300">
          Resumen practico basado en Data Journal (2025) sobre como funciona la deteccion de bots y cuales son las barreras mas comunes.
        </p>
      </div>

      <div class="grid gap-3 md:grid-cols-2">
        <div class="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <p class="text-xs uppercase tracking-wide text-slate-400">What is Anti-Scraping?</p>
          <p class="mt-2 text-sm text-slate-300">
            Conjunto de tecnicas para detectar y bloquear extraccion automatizada de datos. Busca proteger contenido, recursos de servidor y ventaja competitiva.
          </p>
        </div>
        <div class="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <p class="text-xs uppercase tracking-wide text-slate-400">Scraping vs Anti-Scraping</p>
          <p class="mt-2 text-sm text-slate-300">
            Scraping extrae datos con scripts. Anti-scraping evita esa extraccion. Es una carrera continua: mejores scrapers generan mejores defensas.
          </p>
        </div>
      </div>

      <div class="space-y-3">
        <div class="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <p class="font-semibold text-sky-200">1. Login Walls (Auth Walls)</p>
          <p class="mt-1 text-sm text-slate-300">Restringen contenido a usuarios autenticados.</p>
          <p class="mt-1 text-xs text-slate-400">Uso defensivo: proteger datos, modelo de suscripcion y cuentas.</p>
        </div>
        <div class="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <p class="font-semibold text-sky-200">2. IP Address Blocking</p>
          <p class="mt-1 text-sm text-slate-300">Bloquea IPs con patrones de trafico anomalo o exceso de requests.</p>
          <p class="mt-1 text-xs text-slate-400">Uso defensivo: rate limiting por IP, ASN y reputacion.</p>
        </div>
        <div class="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <p class="font-semibold text-sky-200">3. User-Agent and Header Analysis</p>
          <p class="mt-1 text-sm text-slate-300">Valida coherencia de headers HTTP y firmas de cliente.</p>
          <p class="mt-1 text-xs text-slate-400">Uso defensivo: detectar agentes falsos y cabeceras incompletas.</p>
        </div>
        <div class="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <p class="font-semibold text-sky-200">4. Honeypots</p>
          <p class="mt-1 text-sm text-slate-300">Trampas invisibles para bots (enlaces/campos ocultos).</p>
          <p class="mt-1 text-xs text-slate-400">Uso defensivo: identificar automatizacion y aplicar bloqueos progresivos.</p>
        </div>
        <div class="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <p class="font-semibold text-sky-200">5. JavaScript Challenges</p>
          <p class="mt-1 text-sm text-slate-300">Retos en cliente que separan navegadores reales de scripts simples.</p>
          <p class="mt-1 text-xs text-slate-400">Uso defensivo: gate de trafico sospechoso con pruebas dinamicas.</p>
        </div>
        <div class="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <p class="font-semibold text-sky-200">6. CAPTCHAs</p>
          <p class="mt-1 text-sm text-slate-300">Pruebas humano-bot para proteger formularios y endpoints sensibles.</p>
          <p class="mt-1 text-xs text-slate-400">Uso defensivo: activar en eventos de riesgo, no en toda la navegacion.</p>
        </div>
        <div class="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <p class="font-semibold text-sky-200">7. User Behavior Analysis (UBA)</p>
          <p class="mt-1 text-sm text-slate-300">Analiza patrones de interaccion para detectar automatizacion.</p>
          <p class="mt-1 text-xs text-slate-400">Uso defensivo: score de riesgo por sesion y bloqueo adaptativo.</p>
        </div>
      </div>
    </article>

    <article data-tab-panel="hardening" class="security-tab-panel hidden space-y-3">
      <div class="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
        <p class="font-display text-2xl uppercase text-white">Hardening Basico</p>
        <ul class="mt-2 space-y-2 text-sm text-slate-300">
          <li>Rate limiting por IP, ruta y usuario autenticado.</li>
          <li>Validacion de headers, origen y huella de cliente.</li>
          <li>Bloqueo por reputacion y ASN en trafico malicioso.</li>
          <li>WAF con reglas adaptadas a endpoints criticos.</li>
        </ul>
      </div>
    </article>

    <article data-tab-panel="deteccion" class="security-tab-panel hidden space-y-3">
      <div class="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
        <p class="font-display text-2xl uppercase text-white">Deteccion y respuesta</p>
        <ul class="mt-2 space-y-2 text-sm text-slate-300">
          <li>Alertas por picos de scraping y variaciones de UA.</li>
          <li>Trazas por sesion, ip, cookie y fingerprint.</li>
          <li>Bloqueo temporal, challenge o captcha segun riesgo.</li>
          <li>Revision continua de falsos positivos.</li>
        </ul>
      </div>
    </article>

    <article data-tab-panel="legal" class="security-tab-panel hidden space-y-3">
      <div class="rounded-2xl border border-amber-300/30 bg-amber-500/10 p-4">
        <p class="font-display text-2xl uppercase text-white">Legal y cumplimiento</p>
        <p class="mt-2 text-sm text-slate-200">
          Las estrategias de scraping y bypass pueden tener implicancias legales segun jurisdiccion y terminos del sitio.
          Consultar siempre asesoria legal antes de implementar automatizaciones sobre terceros.
        </p>
      </div>
    </article>
  </div>
</section>
`;

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      return resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      return resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      return resolve(row);
    });
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(value);
}

function normalizeText(value, maxLength = 120) {
  return String(value || '').trim().slice(0, maxLength);
}

function looksLikePasswordHash(value) {
  return /^\$2[aby]\$\d{2}\$/.test(String(value || ''));
}

async function hashPassword(rawPassword) {
  const normalized = normalizeText(rawPassword, 120);
  if (!normalized) return '';
  return bcrypt.hash(normalized, BCRYPT_ROUNDS);
}

function normalizeFocalPercent(value, fallback = 50) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(100, Math.max(0, Math.round(num)));
}

function normalizeWhatsappNumber(value) {
  return String(value || '')
    .replace(/\D+/g, '')
    .slice(0, 20);
}

function normalizeContentLanguage(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase();
  if (!normalized) return '';
  if (/^[a-z]{2}(-[a-z]{2})?$/.test(normalized)) return normalized;
  return normalizeText(normalized, 16);
}

function normalizeGeoRegion(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .slice(0, 20);
}

function normalizeGeoPosition(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 64);
}

function normalizeUrl(value, maxLength = 1000) {
  return String(value || '').trim().slice(0, maxLength);
}

function normalizeOgType(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase();
  const allowed = new Set(['website', 'article', 'product', 'profile']);
  return allowed.has(normalized) ? normalized : 'website';
}

function normalizeOgLocale(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const match = raw.match(/^([a-z]{2})[_-]([a-z]{2})$/i);
  if (match) {
    return `${match[1].toLowerCase()}_${match[2].toUpperCase()}`;
  }
  return normalizeText(raw, 16);
}

function normalizeTwitterCardType(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase();
  const allowed = new Set(['summary', 'summary_large_image', 'app', 'player']);
  return allowed.has(normalized) ? normalized : 'summary_large_image';
}

function normalizeTwitterHandle(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const normalized = raw.replace(/\s+/g, '').replace(/^@+/, '').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 15);
  return normalized ? `@${normalized}` : '';
}

function normalizeTemplateFontChoice(value, fallback = DEFAULT_TEMPLATE_BODY_FONT) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .slice(0, 80);
  if (TEMPLATE_FONT_CHOICES.has(normalized)) return normalized;
  const fallbackKey = String(fallback || '')
    .trim()
    .toLowerCase();
  return TEMPLATE_FONT_CHOICES.has(fallbackKey) ? fallbackKey : DEFAULT_TEMPLATE_BODY_FONT;
}

function normalizeGoogleAnalyticsId(value) {
  const raw = String(value || '')
    .trim()
    .toUpperCase();
  if (!raw) return '';

  const extracted = raw.match(/\bG-[A-Z0-9]{4,20}\b/);
  if (extracted) return extracted[0];

  if (/^G-[A-Z0-9]{4,20}$/.test(raw)) return raw;
  return '';
}

function normalizeHexColor(value, fallback) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(normalized)) return normalized;
  return String(fallback || DEFAULT_TEMPLATE_BODY_COLOR).toLowerCase();
}

function normalizeTemplateHeadingSizePx(value, fallback = DEFAULT_TEMPLATE_HEADING_SIZE_PX) {
  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    return Math.min(96, Math.max(18, Math.round(parsed)));
  }
  return Number.isFinite(Number(fallback)) ? Number(fallback) : DEFAULT_TEMPLATE_HEADING_SIZE_PX;
}

function normalizeTemplateHeadingScale(value, fallback = DEFAULT_TEMPLATE_HEADING_SCALE) {
  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    return Math.min(2, Math.max(0.8, Number(parsed.toFixed(2))));
  }
  return Number.isFinite(Number(fallback)) ? Number(fallback) : DEFAULT_TEMPLATE_HEADING_SCALE;
}

function normalizeTemplateBodySizePx(value, fallback = DEFAULT_TEMPLATE_BODY_SIZE_PX) {
  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    return Math.min(24, Math.max(12, Math.round(parsed)));
  }
  return Number.isFinite(Number(fallback)) ? Number(fallback) : DEFAULT_TEMPLATE_BODY_SIZE_PX;
}

function normalizeSchemaType(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase();
  const allowed = new Set([
    'article',
    'webpage',
    'website',
    'product',
    'organization',
    'localbusiness',
    'event',
    'faqpage'
  ]);
  if (!allowed.has(normalized)) return 'Article';
  if (normalized === 'webpage') return 'WebPage';
  if (normalized === 'website') return 'WebSite';
  if (normalized === 'localbusiness') return 'LocalBusiness';
  if (normalized === 'faqpage') return 'FAQPage';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function normalizeAdvancedImagePreview(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase();
  const allowed = new Set(['none', 'standard', 'large']);
  return allowed.has(normalized) ? normalized : 'large';
}

function normalizeDirectiveNumber(value, max = 100000) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  const parsed = Number(raw);
  if (!Number.isInteger(parsed)) return '';
  if (parsed < -1) return '-1';
  if (parsed > max) return String(max);
  return String(parsed);
}

function normalizeDirectiveText(value, maxLength = 240) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function normalizeHreflangEntries(input) {
  let parsed = [];

  if (Array.isArray(input)) {
    parsed = input;
  } else if (typeof input === 'string') {
    const raw = input.trim();
    if (!raw) return [];
    try {
      const maybe = JSON.parse(raw);
      parsed = Array.isArray(maybe) ? maybe : [];
    } catch (_error) {
      parsed = raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [lang, url] = line.split(/\s+/, 2);
          return { lang, url };
        });
    }
  }

  const normalized = [];
  const seen = new Set();

  parsed.forEach((item) => {
    const rawLang = typeof item === 'string' ? item : item?.lang || '';
    const rawUrl = typeof item === 'object' ? item?.url || '' : '';
    const lang = String(rawLang || '')
      .trim()
      .toLowerCase();
    const url = normalizeUrl(rawUrl, 1000);
    if (!lang || !url) return;
    if (!/^(x-default|[a-z]{2,3}(?:-[a-z0-9]{2,8})*)$/i.test(lang)) return;
    const key = `${lang}|${url}`;
    if (seen.has(key)) return;
    seen.add(key);
    normalized.push({ lang, url });
  });

  return normalized.slice(0, 20);
}

function stringifyHreflangEntries(input) {
  return JSON.stringify(normalizeHreflangEntries(input));
}

function normalizeOgImages(input) {
  let parsed = [];

  if (Array.isArray(input)) {
    parsed = input;
  } else if (typeof input === 'string') {
    const raw = input.trim();
    if (raw) {
      try {
        const maybeArray = JSON.parse(raw);
        if (Array.isArray(maybeArray)) parsed = maybeArray;
      } catch (_error) {
        parsed = raw
          .split(/\r?\n|,/)
          .map((entry) => entry.trim())
          .filter(Boolean);
      }
    }
  }

  const normalized = [];
  const seen = new Set();

  for (const item of parsed) {
    const url = normalizeUrl(typeof item === 'string' ? item : item?.url || '', 1000);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    normalized.push({
      url,
      isPrimary: Boolean(typeof item === 'object' && item?.isPrimary)
    });
    if (normalized.length >= 12) break;
  }

  if (!normalized.length) return [];

  const primaryIndex = normalized.findIndex((entry) => entry.isPrimary);
  if (primaryIndex === -1) {
    normalized[0].isPrimary = true;
  } else {
    normalized.forEach((entry, index) => {
      entry.isPrimary = index === primaryIndex;
    });
  }

  return normalized;
}

function stringifyOgImages(input) {
  return JSON.stringify(normalizeOgImages(input));
}

function slugify(value) {
  return normalizeText(value, 80)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseCsv(value) {
  return String(value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function extractImageStem(fileUrl) {
  const raw = String(fileUrl || '').trim();
  if (!raw) return '';
  const normalized = raw.split('?')[0].split('#')[0];
  const baseName = path.posix.basename(normalized);
  const stem = baseName.replace(/\.[a-z0-9]{2,5}$/i, '');
  return stem
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function shouldAutofillImageAlt(value) {
  const text = String(value || '').trim();
  if (!text) return true;
  if (text.length < 3) return true;
  if (text.startsWith('/uploads/')) return true;
  if (/^https?:\/\//i.test(text)) return true;
  if (/^[a-z0-9_.-]+\.(jpg|jpeg|png|webp|gif|avif|svg)$/i.test(text)) return true;
  if (/[\\/]/.test(text) && /\.[a-z0-9]{2,5}$/i.test(text)) return true;
  return false;
}

function buildProductImageAlt(product = {}, fileUrl = '') {
  const productName = normalizeText(product?.name, 100);
  const productCategory = normalizeText(product?.category, 60);
  const productDescription = normalizeText(product?.description, 120);
  const imageStem = normalizeText(extractImageStem(fileUrl), 60);

  const parts = [];
  if (productName) parts.push(productName);
  if (productCategory && !productName.toLowerCase().includes(productCategory.toLowerCase())) {
    parts.push(productCategory);
  }
  if (productDescription) {
    parts.push(productDescription);
  } else if (imageStem) {
    parts.push(imageStem);
  }

  return normalizeText(parts.join(' - '), 160);
}

async function getProductMetaForAlt(productId) {
  const normalizedProductId = Number(productId);
  if (!Number.isInteger(normalizedProductId) || normalizedProductId <= 0) return null;
  return get(
    `SELECT id, name, category, description
     FROM products
     WHERE id = ?`,
    [normalizedProductId]
  );
}

async function isSeoImagesModuleEnabled() {
  const row = await get(
    `SELECT seo_images_module_enabled as enabled
     FROM settings
     WHERE id = 1`
  );
  return Number(row?.enabled ?? 1) === 1;
}

async function refreshProductImageAltTexts(productId, providedProduct = null) {
  if (!(await isSeoImagesModuleEnabled())) return;

  const normalizedProductId = Number(productId);
  if (!Number.isInteger(normalizedProductId) || normalizedProductId <= 0) return;

  const product = providedProduct || (await getProductMetaForAlt(normalizedProductId));
  if (!product) return;

  const images = await all(
    `SELECT id, url, alt_text as altText
     FROM product_images
     WHERE product_id = ?`,
    [normalizedProductId]
  );

  for (const image of images) {
    if (!shouldAutofillImageAlt(image.altText)) continue;
    const nextAlt = buildProductImageAlt(product, image.url);
    const currentAlt = normalizeText(image.altText, 160);
    if (!nextAlt || nextAlt === currentAlt) continue;
    await run('UPDATE product_images SET alt_text = ? WHERE id = ?', [nextAlt, image.id]);
  }
}

async function regenerateAllProductImageAltTexts() {
  if (!(await isSeoImagesModuleEnabled())) {
    throw new Error('El modulo SEO Imagenes esta desactivado.');
  }

  const products = await all(
    `SELECT id, name, category, description
     FROM products
     ORDER BY id ASC`
  );

  let updated = 0;
  let processed = 0;

  for (const product of products) {
    const images = await all(
      `SELECT id, url, alt_text as altText
       FROM product_images
       WHERE product_id = ?`,
      [product.id]
    );

    for (const image of images) {
      const nextAlt = buildProductImageAlt(product, image.url);
      const currentAlt = normalizeText(image.altText, 160);
      if (!nextAlt || nextAlt === currentAlt) continue;
      await run('UPDATE product_images SET alt_text = ? WHERE id = ?', [nextAlt, image.id]);
      updated += 1;
    }
    processed += images.length;
  }

  return {
    products: products.length,
    images: processed,
    updated
  };
}

function formatProductRow(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    priceArs: row.priceArs,
    description: row.description,
    imageUrl: row.imageUrl,
    onSale: Number(row.onSale || 0) === 1,
    colors: parseCsv(row.colorsCsv),
    sizes: parseCsv(row.sizesCsv),
    stockQty: Number(row.stockQty || 0),
    detailText: row.detailText || ''
  };
}

function resolveUploadAbsolutePath(fileUrl) {
  const raw = String(fileUrl || '');
  if (!raw.startsWith('/uploads/')) return null;
  const relative = raw.replace(/^\/uploads\//, '');
  const safeRelative = path.normalize(relative).replace(/^(\.\.(\/|\\|$))+/, '');
  const full = path.join(UPLOADS_ROOT, safeRelative);
  const uploadsRootResolved = path.resolve(UPLOADS_ROOT) + path.sep;
  const resolved = path.resolve(full);
  if (!resolved.startsWith(uploadsRootResolved)) return null;
  return resolved;
}

function buildVariantUrl(fileUrl, variant) {
  const raw = String(fileUrl || '');
  if (!raw.startsWith('/uploads/')) return null;
  const parsed = path.posix.parse(raw);
  if (!parsed.name) return null;
  return `${parsed.dir}/${parsed.name}-${variant}.webp`;
}

function resolveImageWithVariants(imageRow, fallbackAlt = '') {
  const normalizedUrl = normalizeText(imageRow?.url, 1000);
  if (!normalizedUrl) return null;

  const sliderCandidate = buildVariantUrl(normalizedUrl, 'slider');
  const cardCandidate = buildVariantUrl(normalizedUrl, 'card');
  const sliderPath = sliderCandidate ? resolveUploadAbsolutePath(sliderCandidate) : null;
  const cardPath = cardCandidate ? resolveUploadAbsolutePath(cardCandidate) : null;
  const sliderExists = Boolean(sliderPath && fs.existsSync(sliderPath));
  const cardExists = Boolean(cardPath && fs.existsSync(cardPath));

  return {
    url: normalizedUrl,
    alt: normalizeText(imageRow?.alt ?? imageRow?.altText ?? fallbackAlt, 160),
    focalX: normalizeFocalPercent(imageRow?.focalX ?? imageRow?.focal_x, 50),
    focalY: normalizeFocalPercent(imageRow?.focalY ?? imageRow?.focal_y, 50),
    sliderUrl: sliderExists ? sliderCandidate : normalizedUrl,
    cardUrl: cardExists ? cardCandidate : normalizedUrl
  };
}

function buildProductImages(mainUrl, imageRows, fallbackAlt) {
  const normalizedMain = normalizeText(mainUrl, 1000);
  const rows = Array.isArray(imageRows) ? [...imageRows] : [];

  if (!rows.length) {
    return normalizedMain ? [resolveImageWithVariants({ url: normalizedMain, alt: fallbackAlt || '' }, fallbackAlt)].filter(Boolean) : [];
  }

  const mainIndex = normalizedMain ? rows.findIndex((img) => img.url === normalizedMain) : -1;
  if (mainIndex > 0) {
    const [main] = rows.splice(mainIndex, 1);
    rows.unshift(main);
  } else if (mainIndex === -1 && normalizedMain) {
    rows.unshift({ url: normalizedMain, alt: fallbackAlt || '' });
  }

  return rows.map((img) => resolveImageWithVariants(img, fallbackAlt)).filter(Boolean);
}

function fallbackByCategory(category, description) {
  if (category === 'Calzado') {
    return {
      colors: 'Negro,Blanco,Rojo',
      sizes: '39,40,41,42,43,44',
      stockQty: 18,
      detailText: `Producto de calzado deportivo. ${description}`
    };
  }

  if (category === 'Textil') {
    return {
      colors: 'Negro,Blanco,Azul',
      sizes: 'S,M,L,XL',
      stockQty: 30,
      detailText: `Prenda deportiva con foco en comodidad y rendimiento. ${description}`
    };
  }

  return {
    colors: 'Negro,Blanco',
    sizes: 'Unico',
    stockQty: 20,
    detailText: `Accesorio deportivo para entrenamiento y partido. ${description}`
  };
}

async function addColumnIfMissing(tableName, columnName, definition) {
  const columns = await all(`PRAGMA table_info(${tableName})`);
  const exists = columns.some((column) => column.name === columnName);
  if (!exists) {
    await run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

async function ensureSchemaMigrations() {
  await run(`CREATE TABLE IF NOT EXISTS hero_slides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    alt_text TEXT NOT NULL DEFAULT '',
    title TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    focal_x INTEGER NOT NULL DEFAULT 50,
    focal_y INTEGER NOT NULL DEFAULT 50,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  )`);

  await addColumnIfMissing('hero_slides', 'alt_text', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('hero_slides', 'title', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('hero_slides', 'description', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('hero_slides', 'sort_order', 'INTEGER NOT NULL DEFAULT 0');
  await addColumnIfMissing('hero_slides', 'focal_x', 'INTEGER NOT NULL DEFAULT 50');
  await addColumnIfMissing('hero_slides', 'focal_y', 'INTEGER NOT NULL DEFAULT 50');
  await addColumnIfMissing('hero_slides', 'is_active', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('hero_slides', 'created_at', "TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))");
  await addColumnIfMissing('hero_slides', 'updated_at', "TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))");

  await run(`CREATE TABLE IF NOT EXISTS footer_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    brand_title TEXT NOT NULL DEFAULT '',
    brand_description TEXT NOT NULL DEFAULT '',
    contact_title TEXT NOT NULL DEFAULT 'Contacto',
    contact_whatsapp_text TEXT NOT NULL DEFAULT '',
    contact_email_text TEXT NOT NULL DEFAULT '',
    contact_hours_text TEXT NOT NULL DEFAULT '',
    location_title TEXT NOT NULL DEFAULT 'Ubicacion',
    location_line1_text TEXT NOT NULL DEFAULT '',
    location_line2_text TEXT NOT NULL DEFAULT '',
    social_title TEXT NOT NULL DEFAULT 'Redes',
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  )`);
  await addColumnIfMissing('footer_settings', 'brand_title', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('footer_settings', 'brand_description', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('footer_settings', 'contact_title', "TEXT NOT NULL DEFAULT 'Contacto'");
  await addColumnIfMissing('footer_settings', 'contact_whatsapp_text', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('footer_settings', 'contact_email_text', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('footer_settings', 'contact_hours_text', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('footer_settings', 'location_title', "TEXT NOT NULL DEFAULT 'Ubicacion'");
  await addColumnIfMissing('footer_settings', 'location_line1_text', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('footer_settings', 'location_line2_text', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('footer_settings', 'social_title', "TEXT NOT NULL DEFAULT 'Redes'");
  await addColumnIfMissing('footer_settings', 'updated_at', "TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))");

  await addColumnIfMissing('categories', 'icon', "TEXT NOT NULL DEFAULT 'tag'");
  await addColumnIfMissing('pages', 'image_url', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('products', 'colors', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('products', 'sizes', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('products', 'stock_qty', 'INTEGER NOT NULL DEFAULT 0');
  await addColumnIfMissing('products', 'detail_text', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('products', 'on_sale', 'INTEGER NOT NULL DEFAULT 0');

  await addColumnIfMissing('order_items', 'color', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('order_items', 'size', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('order_items', 'detail_text', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('orders', 'customer_province', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('orders', 'customer_city', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('orders', 'customer_postal_code', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('orders', 'delivery_type', "TEXT NOT NULL DEFAULT 'home'");
  await addColumnIfMissing('orders', 'delivery_branch', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'social_instagram_url', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'social_facebook_url', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'social_youtube_url', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'social_x_url', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'template_social_instagram_url', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'template_social_facebook_url', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'template_social_youtube_url', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'template_social_x_url', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'template_heading_font', `TEXT NOT NULL DEFAULT '${DEFAULT_TEMPLATE_HEADING_FONT}'`);
  await addColumnIfMissing('settings', 'template_body_font', `TEXT NOT NULL DEFAULT '${DEFAULT_TEMPLATE_BODY_FONT}'`);
  await addColumnIfMissing('settings', 'template_heading_color', `TEXT NOT NULL DEFAULT '${DEFAULT_TEMPLATE_HEADING_COLOR}'`);
  await addColumnIfMissing('settings', 'template_body_color', `TEXT NOT NULL DEFAULT '${DEFAULT_TEMPLATE_BODY_COLOR}'`);
  await addColumnIfMissing('settings', 'template_heading_scale', `REAL NOT NULL DEFAULT ${DEFAULT_TEMPLATE_HEADING_SCALE}`);
  await addColumnIfMissing('settings', 'template_heading_size_px', `INTEGER NOT NULL DEFAULT ${DEFAULT_TEMPLATE_HEADING_SIZE_PX}`);
  await addColumnIfMissing('settings', 'template_body_size_px', `INTEGER NOT NULL DEFAULT ${DEFAULT_TEMPLATE_BODY_SIZE_PX}`);
  await addColumnIfMissing('settings', 'template_google_analytics_id', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'store_logo_url', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'store_favicon_url', "TEXT NOT NULL DEFAULT ''");
  await run(
    `UPDATE settings
     SET
       template_social_instagram_url = CASE
         WHEN trim(template_social_instagram_url) = '' THEN social_instagram_url
         ELSE template_social_instagram_url
       END,
       template_social_facebook_url = CASE
         WHEN trim(template_social_facebook_url) = '' THEN social_facebook_url
         ELSE template_social_facebook_url
       END,
       template_social_youtube_url = CASE
         WHEN trim(template_social_youtube_url) = '' THEN social_youtube_url
         ELSE template_social_youtube_url
       END,
       template_social_x_url = CASE
         WHEN trim(template_social_x_url) = '' THEN social_x_url
         ELSE template_social_x_url
       END`
  );
  await addColumnIfMissing('product_images', 'focal_x', 'INTEGER NOT NULL DEFAULT 50');
  await addColumnIfMissing('product_images', 'focal_y', 'INTEGER NOT NULL DEFAULT 50');
  await addColumnIfMissing('page_images', 'focal_x', 'INTEGER NOT NULL DEFAULT 50');
  await addColumnIfMissing('page_images', 'focal_y', 'INTEGER NOT NULL DEFAULT 50');

  await addColumnIfMissing('settings', 'seo_html_meta_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_open_graph_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_twitter_cards_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_advanced_tags_enabled', 'INTEGER NOT NULL DEFAULT 0');
  await addColumnIfMissing('settings', 'seo_schema_markup_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_html_default_title', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_html_default_description', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_html_default_keywords', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_html_author', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_html_robots_index_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_html_robots_follow_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_html_content_language', "TEXT NOT NULL DEFAULT 'es'");
  await addColumnIfMissing('settings', 'seo_html_geo_region', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_html_geo_placename', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_html_geo_position', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_og_default_title', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_og_default_description', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_og_images_json', "TEXT NOT NULL DEFAULT '[]'");
  await addColumnIfMissing('settings', 'seo_og_url', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_og_type', "TEXT NOT NULL DEFAULT 'website'");
  await addColumnIfMissing('settings', 'seo_og_site_name', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_og_locale', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_twitter_card_type', "TEXT NOT NULL DEFAULT 'summary_large_image'");
  await addColumnIfMissing('settings', 'seo_twitter_title', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_twitter_description', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_twitter_image_url', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_twitter_site_handle', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_twitter_creator_handle', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_advanced_canonical_url', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_advanced_noarchive_enabled', 'INTEGER NOT NULL DEFAULT 0');
  await addColumnIfMissing('settings', 'seo_advanced_nosnippet_enabled', 'INTEGER NOT NULL DEFAULT 0');
  await addColumnIfMissing('settings', 'seo_advanced_noimageindex_enabled', 'INTEGER NOT NULL DEFAULT 0');
  await addColumnIfMissing('settings', 'seo_advanced_max_snippet', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_advanced_max_image_preview', "TEXT NOT NULL DEFAULT 'large'");
  await addColumnIfMissing('settings', 'seo_advanced_max_video_preview', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_advanced_unavailable_after', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_advanced_googlebot_rules', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_advanced_googlebot_news_rules', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_advanced_hreflang_json', "TEXT NOT NULL DEFAULT '[]'");
  await addColumnIfMissing('settings', 'seo_schema_type', "TEXT NOT NULL DEFAULT 'Article'");
  await addColumnIfMissing('settings', 'seo_schema_name', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_schema_description', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_schema_image_url', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_schema_url', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_schema_author', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_schema_date_published', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_schema_headline', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_google_2026_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_google_2026_agency_name', "TEXT NOT NULL DEFAULT 'Tempocrea'");
  await addColumnIfMissing('settings', 'seo_google_2026_rollout_window_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_google_2026_rollout_window', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_google_2026_technical_seo_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_google_2026_technical_seo', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_google_2026_core_web_vitals_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_google_2026_core_web_vitals', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_google_2026_content_quality_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_google_2026_content_quality', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_google_2026_security_maintenance_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_google_2026_security_maintenance', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_google_2026_local_authority_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_google_2026_local_authority', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_google_2026_user_experience_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_google_2026_user_experience', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_google_2026_competitive_advantage_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_google_2026_competitive_advantage', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_images_module_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_images_file_names_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_images_file_names', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_images_resize_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_images_resize', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_images_compression_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_images_compression', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_images_format_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_images_format', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_images_sitemap_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_images_sitemap', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_images_cdn_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_images_cdn', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_images_lazy_loading_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_images_lazy_loading', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_images_browser_cache_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_images_browser_cache', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_images_structured_data_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_images_structured_data', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_images_social_tags_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_images_social_tags', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_images_audit_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_images_audit', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_tech_files_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_sitemap_generator_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_sitemap_generator_notes', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_robots_txt_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'seo_robots_txt_content', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'seo_htaccess_enabled', 'INTEGER NOT NULL DEFAULT 0');
  await addColumnIfMissing('settings', 'seo_htaccess_content', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('settings', 'security_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'security_headers_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'security_rate_limit_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'security_rate_limit_window_sec', 'INTEGER NOT NULL DEFAULT 60');
  await addColumnIfMissing('settings', 'security_rate_limit_max', 'INTEGER NOT NULL DEFAULT 120');
  await addColumnIfMissing('settings', 'security_order_rate_limit_max', 'INTEGER NOT NULL DEFAULT 20');
  await addColumnIfMissing('settings', 'security_block_bad_ua_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'security_blocked_ua_patterns', "TEXT NOT NULL DEFAULT 'bot,crawler,scrapy,python-requests,curl,wget,httpclient'");
  await addColumnIfMissing('settings', 'security_honeypot_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('settings', 'security_honeypot_field', "TEXT NOT NULL DEFAULT 'website'");
}

async function seedProductsIfNeeded() {
  const row = await get('SELECT COUNT(*) as total FROM products');
  if (row.total > 0) return;

  const products = [
    [
      'Camiseta Titular Pro',
      'Textil',
      45999,
      'Remera técnica deportiva, respirable y liviana.',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
      'Negro,Blanco,Azul',
      'S,M,L,XL',
      42,
      'Camiseta oficial de entrenamiento con paneles de ventilación, costuras reforzadas y tejido de secado rápido para partidos intensos.'
    ],
    [
      'Botines Speed X',
      'Calzado',
      89999,
      'Botines con tapones firmes para cancha natural.',
      'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=800&q=80',
      'Negro,Blanco,Rojo',
      '39,40,41,42,43,44',
      18,
      'Botines livianos con suela de tracción y estructura de estabilidad lateral. Ideal para cambios de ritmo y máxima aceleración.'
    ],
    [
      'Pelota Match Elite',
      'Accesorios',
      38999,
      'Pelota profesional con costura reforzada.',
      'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80',
      'Blanco,Blanco/Azul',
      'N5',
      35,
      'Pelota de competición con cámara de alta retención de aire y cubierta resistente para césped natural o sintético.'
    ],
    [
      'Short Training Dry',
      'Textil',
      29999,
      'Short flexible con secado rápido.',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
      'Negro,Gris,Azul Marino',
      'S,M,L,XL',
      27,
      'Short de entrenamiento con cintura elástica, tejido respirable y corte atlético para entrenar cómodo todos los días.'
    ],
    [
      'Guantes Goal Master',
      'Accesorios',
      51999,
      'Guantes de arquero con gran agarre.',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      'Negro,Negro/Verde',
      '8,9,10,11',
      16,
      'Guantes con palma de látex de alto agarre, muñequera ajustable y refuerzo para amortiguar impactos en atajadas exigentes.'
    ],
    [
      'Mochila Team 30L',
      'Accesorios',
      34999,
      'Mochila deportiva con compartimentos y red lateral.',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
      'Negro,Azul,Gris',
      '30L',
      22,
      'Mochila urbana/deportiva con bolsillo para botines, espacio para hidratación y correas acolchadas para uso diario.'
    ]
  ];

  for (const product of products) {
    await run(
      `INSERT INTO products (
        name, category, price_ars, description, image_url, colors, sizes, stock_qty, detail_text, on_sale
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [...product, 0]
    );
  }
}

async function backfillProductAttributesIfNeeded() {
  const rows = await all(
    `SELECT id, category, description, colors, sizes, stock_qty as stockQty, detail_text as detailText
     FROM products`
  );

  for (const row of rows) {
    const hasColors = Boolean(normalizeText(row.colors));
    const hasSizes = Boolean(normalizeText(row.sizes));
    const hasStock = Number(row.stockQty || 0) > 0;
    const hasDetail = Boolean(normalizeText(row.detailText, 500));

    if (hasColors && hasSizes && hasStock && hasDetail) continue;

    const fallback = fallbackByCategory(row.category, row.description);

    await run(
      `UPDATE products
       SET colors = ?, sizes = ?, stock_qty = ?, detail_text = ?
       WHERE id = ?`,
      [
        hasColors ? normalizeText(row.colors) : fallback.colors,
        hasSizes ? normalizeText(row.sizes) : fallback.sizes,
        hasStock ? Number(row.stockQty) : fallback.stockQty,
        hasDetail ? normalizeText(row.detailText, 500) : fallback.detailText,
        row.id
      ]
    );
  }
}

async function ensureCategoriesAndImagesFromProducts() {
  const products = await all('SELECT id, name, category, description, image_url FROM products');

  for (const product of products) {
    const categoryName = normalizeText(product.category, 80);
    const categorySlug = slugify(categoryName);

    const ensureCategory = async (name) => {
      const slug = slugify(name);
      const existing = await get('SELECT id FROM categories WHERE slug = ?', [slug]);
      if (existing) return existing.id;
      const inserted = await run('INSERT INTO categories (name, slug) VALUES (?, ?)', [name, slug]);
      return inserted.id;
    };

    const assignCategory = async (name) => {
      const catId = await ensureCategory(name);
      await run(
        `INSERT OR IGNORE INTO product_categories (product_id, category_id)
         VALUES (?, ?)`,
        [product.id, catId]
      );
    };

    const mappedCategories = [];
    if (product.category === 'Textil') mappedCategories.push('Indumentaria', 'Entrenamiento');
    if (product.category === 'Calzado') mappedCategories.push('Calzado', 'Fútbol');
    if (product.category === 'Accesorios') mappedCategories.push('Accesorios');

    const nameLower = product.name.toLowerCase();
    if (nameLower.includes('pelota')) mappedCategories.push('Fútbol');
    if (nameLower.includes('botin') || nameLower.includes('botines')) mappedCategories.push('Fútbol');
    if (nameLower.includes('mochila')) mappedCategories.push('Bolsos y mochilas');
    if (nameLower.includes('training') || nameLower.includes('entrenamiento')) mappedCategories.push('Entrenamiento');
    if (nameLower.includes('running')) mappedCategories.push('Running');

    // always include original category as a fallback category
    mappedCategories.push(categoryName);

    for (const cat of new Set(mappedCategories)) {
      await assignCategory(cat);
    }

    const hasImage = await get('SELECT id FROM product_images WHERE product_id = ? LIMIT 1', [product.id]);
    if (!hasImage) {
      await run(
        `INSERT INTO product_images (product_id, url, alt_text, sort_order)
         VALUES (?, ?, ?, 0)`,
        [product.id, product.image_url, buildProductImageAlt(product, product.image_url)]
      );
    }

    await refreshProductImageAltTexts(product.id, product);
  }
}

async function seedDefaultCategories() {
  const iconByCategory = {
    'Fútbol': 'goal',
    Entrenamiento: 'dumbbell',
    Running: 'footprints',
    Indumentaria: 'shirt',
    Calzado: 'footprints',
    Accesorios: 'watch',
    'Bolsos y mochilas': 'backpack'
  };

  for (const name of DEFAULT_CATEGORIES) {
    const slug = slugify(name);
    const icon = normalizeText(iconByCategory[name] || 'tag', 40).toLowerCase() || 'tag';
    await run(
      `INSERT OR IGNORE INTO categories (name, slug, icon)
       VALUES (?, ?, ?)`,
      [name, slug, icon]
    );
    await run(
      `UPDATE categories
       SET icon = ?
       WHERE slug = ?
         AND (icon IS NULL OR trim(icon) = '' OR icon = 'tag')`,
      [icon, slug]
    );
  }

  await run(
    `UPDATE categories
     SET icon = 'footprints'
     WHERE slug = 'calzado'
       AND (icon IS NULL OR trim(icon) = '' OR icon = 'tag' OR icon = 'shoe' OR icon = 'sneaker')`
  );
}

async function seedPages() {
  await run(
    `INSERT INTO pages (slug, title, content_html)
     VALUES (?, ?, ?)
     ON CONFLICT(slug) DO UPDATE SET
       title = excluded.title,
       content_html = excluded.content_html,
       updated_at = datetime('now', 'localtime')`,
    ['help', HELP_PAGE_TITLE, HELP_PAGE_CONTENT_HTML]
  );

  await run(
    `INSERT INTO pages (slug, title, content_html)
     VALUES (?, ?, ?)
     ON CONFLICT(slug) DO UPDATE SET
       title = excluded.title,
       content_html = excluded.content_html,
       updated_at = datetime('now', 'localtime')`,
    ['security', SECURITY_PAGE_TITLE, SECURITY_PAGE_CONTENT_HTML]
  );
}

async function seedHeroSlides() {
  const row = await get('SELECT COUNT(*) as total FROM hero_slides');
  if (Number(row?.total || 0) > 0) return;

  for (const slide of DEFAULT_HERO_SLIDES) {
    const url = normalizeText(slide.url, 1000);
    if (!url) continue;
    await run(
      `INSERT INTO hero_slides (url, alt_text, title, description, sort_order, focal_x, focal_y, is_active)
       VALUES (?, ?, ?, ?, ?, 50, 50, 1)`,
      [
        url,
        normalizeText(slide.altText, 180),
        normalizeText(slide.title, 160),
        normalizeText(slide.description, 280),
        Number.isInteger(Number(slide.sortOrder)) ? Number(slide.sortOrder) : 0
      ]
    );
  }
}

async function seedDefaultAdminUser() {
  const passwordHash = await hashPassword(DEFAULT_ADMIN_USER.password);
  await run(
    `INSERT OR IGNORE INTO users (username, password, full_name, role, is_active)
     VALUES (?, ?, ?, ?, 1)`,
    [DEFAULT_ADMIN_USER.username, passwordHash, DEFAULT_ADMIN_USER.fullName, DEFAULT_ADMIN_USER.role]
  );
}

async function migrateLegacyUserPasswords() {
  const rows = await all('SELECT id, password FROM users');
  for (const row of rows) {
    const current = String(row?.password || '');
    if (!current || looksLikePasswordHash(current)) continue;
    const nextHash = await hashPassword(current);
    if (!nextHash) continue;
    await run('UPDATE users SET password = ? WHERE id = ?', [nextHash, row.id]);
  }
}

async function seedSettings() {
  await run(
    `INSERT OR IGNORE INTO settings (
      id,
      store_name,
      whatsapp_number,
      seo_social_meta_enabled,
      seo_html_meta_enabled,
      seo_open_graph_enabled,
      seo_twitter_cards_enabled,
      seo_advanced_tags_enabled,
      seo_schema_markup_enabled,
      seo_html_default_title,
      seo_html_default_description,
      seo_html_default_keywords,
      seo_html_author,
      seo_html_robots_index_enabled,
      seo_html_robots_follow_enabled,
      seo_html_content_language,
      seo_html_geo_region,
      seo_html_geo_placename,
      seo_html_geo_position,
      seo_og_default_title,
      seo_og_default_description,
      seo_og_images_json,
      seo_og_url,
      seo_og_type,
      seo_og_site_name,
      seo_og_locale,
      seo_twitter_card_type,
      seo_twitter_title,
      seo_twitter_description,
      seo_twitter_image_url,
      seo_twitter_site_handle,
      seo_twitter_creator_handle,
      seo_advanced_canonical_url,
      seo_advanced_noarchive_enabled,
      seo_advanced_nosnippet_enabled,
      seo_advanced_noimageindex_enabled,
      seo_advanced_max_snippet,
      seo_advanced_max_image_preview,
      seo_advanced_max_video_preview,
      seo_advanced_unavailable_after,
      seo_advanced_googlebot_rules,
      seo_advanced_googlebot_news_rules,
      seo_advanced_hreflang_json,
      seo_schema_type,
      seo_schema_name,
      seo_schema_description,
      seo_schema_image_url,
      seo_schema_url,
      seo_schema_author,
      seo_schema_date_published,
      seo_schema_headline
     ) VALUES (1, ?, ?, 1, 1, 1, 1, 0, 1, '', '', '', '', 1, 1, 'es', '', '', '', '', '', '[]', '', 'website', '', '', 'summary_large_image', '', '', '', '', '', '', 0, 0, 0, '', 'large', '', '', '', '', '[]', 'Article', '', '', '', '', '', '', '')`,
    [DEFAULT_STORE_NAME, DEFAULT_WHATSAPP_NUMBER]
  );

  await run(
    `UPDATE settings
     SET
       seo_google_2026_enabled = CASE
         WHEN seo_google_2026_enabled IS NULL THEN ?
         ELSE seo_google_2026_enabled
       END,
       seo_google_2026_agency_name = CASE
         WHEN trim(seo_google_2026_agency_name) = '' THEN ?
         ELSE seo_google_2026_agency_name
       END,
       seo_google_2026_rollout_window_enabled = CASE
         WHEN seo_google_2026_rollout_window_enabled IS NULL THEN ?
         ELSE seo_google_2026_rollout_window_enabled
       END,
       seo_google_2026_rollout_window = CASE
         WHEN trim(seo_google_2026_rollout_window) = '' THEN ?
         ELSE seo_google_2026_rollout_window
       END,
       seo_google_2026_technical_seo_enabled = CASE
         WHEN seo_google_2026_technical_seo_enabled IS NULL THEN ?
         ELSE seo_google_2026_technical_seo_enabled
       END,
       seo_google_2026_technical_seo = CASE
         WHEN trim(seo_google_2026_technical_seo) = '' THEN ?
         ELSE seo_google_2026_technical_seo
       END,
       seo_google_2026_core_web_vitals_enabled = CASE
         WHEN seo_google_2026_core_web_vitals_enabled IS NULL THEN ?
         ELSE seo_google_2026_core_web_vitals_enabled
       END,
       seo_google_2026_core_web_vitals = CASE
         WHEN trim(seo_google_2026_core_web_vitals) = '' THEN ?
         ELSE seo_google_2026_core_web_vitals
       END,
       seo_google_2026_content_quality_enabled = CASE
         WHEN seo_google_2026_content_quality_enabled IS NULL THEN ?
         ELSE seo_google_2026_content_quality_enabled
       END,
       seo_google_2026_content_quality = CASE
         WHEN trim(seo_google_2026_content_quality) = '' THEN ?
         ELSE seo_google_2026_content_quality
       END,
       seo_google_2026_security_maintenance_enabled = CASE
         WHEN seo_google_2026_security_maintenance_enabled IS NULL THEN ?
         ELSE seo_google_2026_security_maintenance_enabled
       END,
       seo_google_2026_security_maintenance = CASE
         WHEN trim(seo_google_2026_security_maintenance) = '' THEN ?
         ELSE seo_google_2026_security_maintenance
       END,
       seo_google_2026_local_authority_enabled = CASE
         WHEN seo_google_2026_local_authority_enabled IS NULL THEN ?
         ELSE seo_google_2026_local_authority_enabled
       END,
       seo_google_2026_local_authority = CASE
         WHEN trim(seo_google_2026_local_authority) = '' THEN ?
         ELSE seo_google_2026_local_authority
       END,
       seo_google_2026_user_experience_enabled = CASE
         WHEN seo_google_2026_user_experience_enabled IS NULL THEN ?
         ELSE seo_google_2026_user_experience_enabled
       END,
       seo_google_2026_user_experience = CASE
         WHEN trim(seo_google_2026_user_experience) = '' THEN ?
         ELSE seo_google_2026_user_experience
       END,
       seo_google_2026_competitive_advantage_enabled = CASE
         WHEN seo_google_2026_competitive_advantage_enabled IS NULL THEN ?
         ELSE seo_google_2026_competitive_advantage_enabled
       END,
       seo_google_2026_competitive_advantage = CASE
         WHEN trim(seo_google_2026_competitive_advantage) = '' THEN ?
         ELSE seo_google_2026_competitive_advantage
       END
     WHERE id = 1`,
    [
      Number(GOOGLE_2026_DEFAULTS.moduleEnabled) ? 1 : 0,
      normalizeGoogle2026Text(GOOGLE_2026_DEFAULTS.agencyName, 120),
      Number(GOOGLE_2026_DEFAULTS.rolloutWindowEnabled) ? 1 : 0,
      normalizeGoogle2026Text(GOOGLE_2026_DEFAULTS.rolloutWindow, 800),
      Number(GOOGLE_2026_DEFAULTS.technicalSeoEnabled) ? 1 : 0,
      normalizeGoogle2026Text(GOOGLE_2026_DEFAULTS.technicalSeo, 4000),
      Number(GOOGLE_2026_DEFAULTS.coreWebVitalsEnabled) ? 1 : 0,
      normalizeGoogle2026Text(GOOGLE_2026_DEFAULTS.coreWebVitals, 4000),
      Number(GOOGLE_2026_DEFAULTS.contentQualityEnabled) ? 1 : 0,
      normalizeGoogle2026Text(GOOGLE_2026_DEFAULTS.contentQuality, 4000),
      Number(GOOGLE_2026_DEFAULTS.securityMaintenanceEnabled) ? 1 : 0,
      normalizeGoogle2026Text(GOOGLE_2026_DEFAULTS.securityMaintenance, 4000),
      Number(GOOGLE_2026_DEFAULTS.localAuthorityEnabled) ? 1 : 0,
      normalizeGoogle2026Text(GOOGLE_2026_DEFAULTS.localAuthority, 4000),
      Number(GOOGLE_2026_DEFAULTS.userExperienceEnabled) ? 1 : 0,
      normalizeGoogle2026Text(GOOGLE_2026_DEFAULTS.userExperience, 4000),
      Number(GOOGLE_2026_DEFAULTS.competitiveAdvantageEnabled) ? 1 : 0,
      normalizeGoogle2026Text(GOOGLE_2026_DEFAULTS.competitiveAdvantage, 4000)
    ]
  );

  await run(
    `UPDATE settings
     SET
       seo_images_module_enabled = CASE
         WHEN seo_images_module_enabled IS NULL THEN ?
         ELSE seo_images_module_enabled
       END,
       seo_images_file_names_enabled = CASE
         WHEN seo_images_file_names_enabled IS NULL THEN ?
         ELSE seo_images_file_names_enabled
       END,
       seo_images_file_names = CASE
         WHEN trim(seo_images_file_names) = '' THEN ?
         ELSE seo_images_file_names
       END,
       seo_images_resize_enabled = CASE
         WHEN seo_images_resize_enabled IS NULL THEN ?
         ELSE seo_images_resize_enabled
       END,
       seo_images_resize = CASE
         WHEN trim(seo_images_resize) = '' THEN ?
         ELSE seo_images_resize
       END,
       seo_images_compression_enabled = CASE
         WHEN seo_images_compression_enabled IS NULL THEN ?
         ELSE seo_images_compression_enabled
       END,
       seo_images_compression = CASE
         WHEN trim(seo_images_compression) = '' THEN ?
         ELSE seo_images_compression
       END,
       seo_images_format_enabled = CASE
         WHEN seo_images_format_enabled IS NULL THEN ?
         ELSE seo_images_format_enabled
       END,
       seo_images_format = CASE
         WHEN trim(seo_images_format) = '' THEN ?
         ELSE seo_images_format
       END,
       seo_images_sitemap_enabled = CASE
         WHEN seo_images_sitemap_enabled IS NULL THEN ?
         ELSE seo_images_sitemap_enabled
       END,
       seo_images_sitemap = CASE
         WHEN trim(seo_images_sitemap) = '' THEN ?
         ELSE seo_images_sitemap
       END,
       seo_images_cdn_enabled = CASE
         WHEN seo_images_cdn_enabled IS NULL THEN ?
         ELSE seo_images_cdn_enabled
       END,
       seo_images_cdn = CASE
         WHEN trim(seo_images_cdn) = '' THEN ?
         ELSE seo_images_cdn
       END,
       seo_images_lazy_loading_enabled = CASE
         WHEN seo_images_lazy_loading_enabled IS NULL THEN ?
         ELSE seo_images_lazy_loading_enabled
       END,
       seo_images_lazy_loading = CASE
         WHEN trim(seo_images_lazy_loading) = '' THEN ?
         ELSE seo_images_lazy_loading
       END,
       seo_images_browser_cache_enabled = CASE
         WHEN seo_images_browser_cache_enabled IS NULL THEN ?
         ELSE seo_images_browser_cache_enabled
       END,
       seo_images_browser_cache = CASE
         WHEN trim(seo_images_browser_cache) = '' THEN ?
         ELSE seo_images_browser_cache
       END,
       seo_images_structured_data_enabled = CASE
         WHEN seo_images_structured_data_enabled IS NULL THEN ?
         ELSE seo_images_structured_data_enabled
       END,
       seo_images_structured_data = CASE
         WHEN trim(seo_images_structured_data) = '' THEN ?
         ELSE seo_images_structured_data
       END,
       seo_images_social_tags_enabled = CASE
         WHEN seo_images_social_tags_enabled IS NULL THEN ?
         ELSE seo_images_social_tags_enabled
       END,
       seo_images_social_tags = CASE
         WHEN trim(seo_images_social_tags) = '' THEN ?
         ELSE seo_images_social_tags
       END,
       seo_images_audit_enabled = CASE
         WHEN seo_images_audit_enabled IS NULL THEN ?
         ELSE seo_images_audit_enabled
       END,
       seo_images_audit = CASE
         WHEN trim(seo_images_audit) = '' THEN ?
         ELSE seo_images_audit
       END
     WHERE id = 1`,
    [
      Number(SEO_IMAGES_DEFAULTS.moduleEnabled) ? 1 : 0,
      Number(SEO_IMAGES_DEFAULTS.fileNamesEnabled) ? 1 : 0,
      normalizeSeoImagesText(SEO_IMAGES_DEFAULTS.fileNames, 4000),
      Number(SEO_IMAGES_DEFAULTS.resizeEnabled) ? 1 : 0,
      normalizeSeoImagesText(SEO_IMAGES_DEFAULTS.resize, 4000),
      Number(SEO_IMAGES_DEFAULTS.compressionEnabled) ? 1 : 0,
      normalizeSeoImagesText(SEO_IMAGES_DEFAULTS.compression, 4000),
      Number(SEO_IMAGES_DEFAULTS.formatEnabled) ? 1 : 0,
      normalizeSeoImagesText(SEO_IMAGES_DEFAULTS.format, 4000),
      Number(SEO_IMAGES_DEFAULTS.sitemapEnabled) ? 1 : 0,
      normalizeSeoImagesText(SEO_IMAGES_DEFAULTS.sitemap, 4000),
      Number(SEO_IMAGES_DEFAULTS.cdnEnabled) ? 1 : 0,
      normalizeSeoImagesText(SEO_IMAGES_DEFAULTS.cdn, 4000),
      Number(SEO_IMAGES_DEFAULTS.lazyLoadingEnabled) ? 1 : 0,
      normalizeSeoImagesText(SEO_IMAGES_DEFAULTS.lazyLoading, 4000),
      Number(SEO_IMAGES_DEFAULTS.browserCacheEnabled) ? 1 : 0,
      normalizeSeoImagesText(SEO_IMAGES_DEFAULTS.browserCache, 4000),
      Number(SEO_IMAGES_DEFAULTS.structuredDataEnabled) ? 1 : 0,
      normalizeSeoImagesText(SEO_IMAGES_DEFAULTS.structuredData, 4000),
      Number(SEO_IMAGES_DEFAULTS.socialTagsEnabled) ? 1 : 0,
      normalizeSeoImagesText(SEO_IMAGES_DEFAULTS.socialTags, 4000),
      Number(SEO_IMAGES_DEFAULTS.auditEnabled) ? 1 : 0,
      normalizeSeoImagesText(SEO_IMAGES_DEFAULTS.audit, 4000)
    ]
  );

  await run(
    `UPDATE settings
     SET
       seo_tech_files_enabled = CASE
         WHEN seo_tech_files_enabled IS NULL THEN ?
         ELSE seo_tech_files_enabled
       END,
       seo_sitemap_generator_enabled = CASE
         WHEN seo_sitemap_generator_enabled IS NULL THEN ?
         ELSE seo_sitemap_generator_enabled
       END,
       seo_sitemap_generator_notes = CASE
         WHEN trim(seo_sitemap_generator_notes) = '' THEN ?
         ELSE seo_sitemap_generator_notes
       END,
       seo_robots_txt_enabled = CASE
         WHEN seo_robots_txt_enabled IS NULL THEN ?
         ELSE seo_robots_txt_enabled
       END,
       seo_robots_txt_content = CASE
         WHEN trim(seo_robots_txt_content) = '' THEN ?
         ELSE seo_robots_txt_content
       END,
       seo_htaccess_enabled = CASE
         WHEN seo_htaccess_enabled IS NULL THEN ?
         ELSE seo_htaccess_enabled
       END,
       seo_htaccess_content = CASE
         WHEN trim(seo_htaccess_content) = '' THEN ?
         ELSE seo_htaccess_content
       END
     WHERE id = 1`,
    [
      Number(SEO_TECH_FILES_DEFAULTS.moduleEnabled) ? 1 : 0,
      Number(SEO_TECH_FILES_DEFAULTS.sitemapGeneratorEnabled) ? 1 : 0,
      normalizeSeoTechFileText(SEO_TECH_FILES_DEFAULTS.sitemapGeneratorNotes, 4000),
      Number(SEO_TECH_FILES_DEFAULTS.robotsTxtEnabled) ? 1 : 0,
      normalizeSeoTechFileText(SEO_TECH_FILES_DEFAULTS.robotsTxtContent, 12000),
      Number(SEO_TECH_FILES_DEFAULTS.htaccessEnabled) ? 1 : 0,
      normalizeSeoTechFileText(SEO_TECH_FILES_DEFAULTS.htaccessContent, 16000)
    ]
  );
}

async function seedFooterSettings() {
  const settings = await getSettings();
  const fallbackStoreName = normalizeText(settings?.storeName || DEFAULT_STORE_NAME, 120);
  const fallbackWhatsapp = normalizeText(settings?.whatsappNumber || DEFAULT_WHATSAPP_NUMBER, 40);
  const whatsappText = fallbackWhatsapp ? `WhatsApp: ${fallbackWhatsapp}` : '';

  await run(
    `INSERT OR IGNORE INTO footer_settings (
      id,
      brand_title,
      brand_description,
      contact_title,
      contact_whatsapp_text,
      contact_email_text,
      contact_hours_text,
      location_title,
      location_line1_text,
      location_line2_text,
      social_title
    ) VALUES (1, ?, ?, 'Contacto', ?, ?, ?, 'Ubicacion', ?, ?, 'Redes')`,
    [
      fallbackStoreName,
      'Tienda deportiva online. Atencion personalizada para pedidos por WhatsApp en toda Argentina.',
      whatsappText,
      `Email: ${DEFAULT_FOOTER_CONTACT_EMAIL}`,
      DEFAULT_FOOTER_CONTACT_HOURS,
      DEFAULT_FOOTER_LOCATION_LINE1,
      DEFAULT_FOOTER_LOCATION_LINE2
    ]
  );
}

function buildWhatsappMessage(order) {
  const itemsTotal = Number(order.items_total_ars || 0);
  const shippingTotal = Number(order.shipping_ars || 0);
  const finalTotal = Number(order.total_ars || 0);
  const lines = [
    '🛒 *Nuevo pedido*',
    `Pedido #${order.id}`,
    `Cliente: ${order.customer_name}`,
    `Teléfono: ${order.customer_phone}`,
    `Provincia: ${order.customer_province || '-'}`,
    `Ciudad: ${order.customer_city || '-'}`,
    `Codigo postal: ${order.customer_postal_code || '-'}`,
    `Entrega: ${order.delivery_type === 'branch' ? 'Sucursal Correo Argentino' : 'Domicilio'}`,
    `${
      order.delivery_type === 'branch'
        ? `Sucursal: ${order.delivery_branch || '-'}`
        : `Dirección: ${order.customer_address || 'Sin dirección'}`
    }`,
    '',
    '*Detalle:*'
  ];

  order.items.forEach((item) => {
    const attrs = [];
    if (item.color) attrs.push(`Color: ${item.color}`);
    if (item.size) attrs.push(`Talle: ${item.size}`);
    if (item.detail_text) attrs.push(`Detalle: ${item.detail_text}`);
    const attrsText = attrs.length ? ` (${attrs.join(', ')})` : '';

    lines.push(`- ${item.name}${attrsText} x${item.quantity} = ${formatCurrency(item.subtotal_ars)}`);
    if (item.product_url) {
      lines.push(item.product_url);
    }
  });

  lines.push('');
  lines.push(`Subtotal productos: ${formatCurrency(itemsTotal)}`);
  lines.push(`Envio: ${formatCurrency(shippingTotal)}`);
  lines.push(`*Total pedido: ${formatCurrency(finalTotal)}*`);
  if (order.customer_notes) {
    lines.push('');
    lines.push(`Notas: ${order.customer_notes}`);
  }

  return lines.join('\n');
}

async function initDb() {
  await run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price_ars INTEGER NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    colors TEXT NOT NULL DEFAULT '',
    sizes TEXT NOT NULL DEFAULT '',
    stock_qty INTEGER NOT NULL DEFAULT 0,
    detail_text TEXT NOT NULL DEFAULT '',
    on_sale INTEGER NOT NULL DEFAULT 0
  )`);

  await run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL DEFAULT 'tag'
  )`);

  await run(`CREATE TABLE IF NOT EXISTS product_categories (
    product_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (product_id, category_id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    alt_text TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    focal_x INTEGER NOT NULL DEFAULT 50,
    focal_y INTEGER NOT NULL DEFAULT 50,
    FOREIGN KEY (product_id) REFERENCES products(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL DEFAULT '',
    content_html TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  )`);

  await run(`CREATE TABLE IF NOT EXISTS page_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    alt_text TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    focal_x INTEGER NOT NULL DEFAULT 50,
    focal_y INTEGER NOT NULL DEFAULT 50,
    FOREIGN KEY (page_id) REFERENCES pages(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  )`);

  await run(`CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    store_name TEXT NOT NULL,
    store_logo_url TEXT NOT NULL DEFAULT '',
    store_favicon_url TEXT NOT NULL DEFAULT '',
    whatsapp_number TEXT NOT NULL,
    social_instagram_url TEXT NOT NULL DEFAULT '',
    social_facebook_url TEXT NOT NULL DEFAULT '',
    social_youtube_url TEXT NOT NULL DEFAULT '',
    social_x_url TEXT NOT NULL DEFAULT '',
    template_social_instagram_url TEXT NOT NULL DEFAULT '',
    template_social_facebook_url TEXT NOT NULL DEFAULT '',
    template_social_youtube_url TEXT NOT NULL DEFAULT '',
    template_social_x_url TEXT NOT NULL DEFAULT '',
    template_heading_font TEXT NOT NULL DEFAULT 'space-grotesk',
    template_body_font TEXT NOT NULL DEFAULT 'inter',
    template_heading_color TEXT NOT NULL DEFAULT '#ffffff',
    template_body_color TEXT NOT NULL DEFAULT '#e2e8f0',
    template_heading_scale REAL NOT NULL DEFAULT 1,
    template_heading_size_px INTEGER NOT NULL DEFAULT 32,
    template_body_size_px INTEGER NOT NULL DEFAULT 16,
    template_google_analytics_id TEXT NOT NULL DEFAULT '',
    seo_social_meta_enabled INTEGER NOT NULL DEFAULT 1,
    seo_html_meta_enabled INTEGER NOT NULL DEFAULT 1,
    seo_open_graph_enabled INTEGER NOT NULL DEFAULT 1,
    seo_twitter_cards_enabled INTEGER NOT NULL DEFAULT 1,
    seo_advanced_tags_enabled INTEGER NOT NULL DEFAULT 0,
    seo_schema_markup_enabled INTEGER NOT NULL DEFAULT 1,
    seo_html_default_title TEXT NOT NULL DEFAULT '',
    seo_html_default_description TEXT NOT NULL DEFAULT '',
    seo_html_default_keywords TEXT NOT NULL DEFAULT '',
    seo_html_author TEXT NOT NULL DEFAULT '',
    seo_html_robots_index_enabled INTEGER NOT NULL DEFAULT 1,
    seo_html_robots_follow_enabled INTEGER NOT NULL DEFAULT 1,
    seo_html_content_language TEXT NOT NULL DEFAULT 'es',
    seo_html_geo_region TEXT NOT NULL DEFAULT '',
    seo_html_geo_placename TEXT NOT NULL DEFAULT '',
    seo_html_geo_position TEXT NOT NULL DEFAULT '',
    seo_og_default_title TEXT NOT NULL DEFAULT '',
    seo_og_default_description TEXT NOT NULL DEFAULT '',
    seo_og_images_json TEXT NOT NULL DEFAULT '[]',
    seo_og_url TEXT NOT NULL DEFAULT '',
    seo_og_type TEXT NOT NULL DEFAULT 'website',
    seo_og_site_name TEXT NOT NULL DEFAULT '',
    seo_og_locale TEXT NOT NULL DEFAULT '',
    seo_twitter_card_type TEXT NOT NULL DEFAULT 'summary_large_image',
    seo_twitter_title TEXT NOT NULL DEFAULT '',
    seo_twitter_description TEXT NOT NULL DEFAULT '',
    seo_twitter_image_url TEXT NOT NULL DEFAULT '',
    seo_twitter_site_handle TEXT NOT NULL DEFAULT '',
    seo_twitter_creator_handle TEXT NOT NULL DEFAULT '',
    seo_advanced_canonical_url TEXT NOT NULL DEFAULT '',
    seo_advanced_noarchive_enabled INTEGER NOT NULL DEFAULT 0,
    seo_advanced_nosnippet_enabled INTEGER NOT NULL DEFAULT 0,
    seo_advanced_noimageindex_enabled INTEGER NOT NULL DEFAULT 0,
    seo_advanced_max_snippet TEXT NOT NULL DEFAULT '',
    seo_advanced_max_image_preview TEXT NOT NULL DEFAULT 'large',
    seo_advanced_max_video_preview TEXT NOT NULL DEFAULT '',
    seo_advanced_unavailable_after TEXT NOT NULL DEFAULT '',
    seo_advanced_googlebot_rules TEXT NOT NULL DEFAULT '',
    seo_advanced_googlebot_news_rules TEXT NOT NULL DEFAULT '',
    seo_advanced_hreflang_json TEXT NOT NULL DEFAULT '[]',
    seo_schema_type TEXT NOT NULL DEFAULT 'Article',
    seo_schema_name TEXT NOT NULL DEFAULT '',
    seo_schema_description TEXT NOT NULL DEFAULT '',
    seo_schema_image_url TEXT NOT NULL DEFAULT '',
    seo_schema_url TEXT NOT NULL DEFAULT '',
    seo_schema_author TEXT NOT NULL DEFAULT '',
    seo_schema_date_published TEXT NOT NULL DEFAULT '',
    seo_schema_headline TEXT NOT NULL DEFAULT '',
    seo_google_2026_enabled INTEGER NOT NULL DEFAULT 1,
    seo_google_2026_agency_name TEXT NOT NULL DEFAULT 'Tempocrea',
    seo_google_2026_rollout_window_enabled INTEGER NOT NULL DEFAULT 1,
    seo_google_2026_rollout_window TEXT NOT NULL DEFAULT '',
    seo_google_2026_technical_seo_enabled INTEGER NOT NULL DEFAULT 1,
    seo_google_2026_technical_seo TEXT NOT NULL DEFAULT '',
    seo_google_2026_core_web_vitals_enabled INTEGER NOT NULL DEFAULT 1,
    seo_google_2026_core_web_vitals TEXT NOT NULL DEFAULT '',
    seo_google_2026_content_quality_enabled INTEGER NOT NULL DEFAULT 1,
    seo_google_2026_content_quality TEXT NOT NULL DEFAULT '',
    seo_google_2026_security_maintenance_enabled INTEGER NOT NULL DEFAULT 1,
    seo_google_2026_security_maintenance TEXT NOT NULL DEFAULT '',
    seo_google_2026_local_authority_enabled INTEGER NOT NULL DEFAULT 1,
    seo_google_2026_local_authority TEXT NOT NULL DEFAULT '',
    seo_google_2026_user_experience_enabled INTEGER NOT NULL DEFAULT 1,
    seo_google_2026_user_experience TEXT NOT NULL DEFAULT '',
    seo_google_2026_competitive_advantage_enabled INTEGER NOT NULL DEFAULT 1,
    seo_google_2026_competitive_advantage TEXT NOT NULL DEFAULT '',
    seo_images_module_enabled INTEGER NOT NULL DEFAULT 1,
    seo_images_file_names_enabled INTEGER NOT NULL DEFAULT 1,
    seo_images_file_names TEXT NOT NULL DEFAULT '',
    seo_images_resize_enabled INTEGER NOT NULL DEFAULT 1,
    seo_images_resize TEXT NOT NULL DEFAULT '',
    seo_images_compression_enabled INTEGER NOT NULL DEFAULT 1,
    seo_images_compression TEXT NOT NULL DEFAULT '',
    seo_images_format_enabled INTEGER NOT NULL DEFAULT 1,
    seo_images_format TEXT NOT NULL DEFAULT '',
    seo_images_sitemap_enabled INTEGER NOT NULL DEFAULT 1,
    seo_images_sitemap TEXT NOT NULL DEFAULT '',
    seo_images_cdn_enabled INTEGER NOT NULL DEFAULT 1,
    seo_images_cdn TEXT NOT NULL DEFAULT '',
    seo_images_lazy_loading_enabled INTEGER NOT NULL DEFAULT 1,
    seo_images_lazy_loading TEXT NOT NULL DEFAULT '',
    seo_images_browser_cache_enabled INTEGER NOT NULL DEFAULT 1,
    seo_images_browser_cache TEXT NOT NULL DEFAULT '',
    seo_images_structured_data_enabled INTEGER NOT NULL DEFAULT 1,
    seo_images_structured_data TEXT NOT NULL DEFAULT '',
    seo_images_social_tags_enabled INTEGER NOT NULL DEFAULT 1,
    seo_images_social_tags TEXT NOT NULL DEFAULT '',
    seo_images_audit_enabled INTEGER NOT NULL DEFAULT 1,
    seo_images_audit TEXT NOT NULL DEFAULT '',
    seo_tech_files_enabled INTEGER NOT NULL DEFAULT 1,
    seo_sitemap_generator_enabled INTEGER NOT NULL DEFAULT 1,
    seo_sitemap_generator_notes TEXT NOT NULL DEFAULT '',
    seo_robots_txt_enabled INTEGER NOT NULL DEFAULT 1,
    seo_robots_txt_content TEXT NOT NULL DEFAULT '',
    seo_htaccess_enabled INTEGER NOT NULL DEFAULT 0,
    seo_htaccess_content TEXT NOT NULL DEFAULT '',
    security_enabled INTEGER NOT NULL DEFAULT 1,
    security_headers_enabled INTEGER NOT NULL DEFAULT 1,
    security_rate_limit_enabled INTEGER NOT NULL DEFAULT 1,
    security_rate_limit_window_sec INTEGER NOT NULL DEFAULT 60,
    security_rate_limit_max INTEGER NOT NULL DEFAULT 120,
    security_order_rate_limit_max INTEGER NOT NULL DEFAULT 20,
    security_block_bad_ua_enabled INTEGER NOT NULL DEFAULT 1,
    security_blocked_ua_patterns TEXT NOT NULL DEFAULT 'bot,crawler,scrapy,python-requests,curl,wget,httpclient',
    security_honeypot_enabled INTEGER NOT NULL DEFAULT 1,
    security_honeypot_field TEXT NOT NULL DEFAULT 'website',
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  )`);

  await run(`CREATE TABLE IF NOT EXISTS footer_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    brand_title TEXT NOT NULL DEFAULT '',
    brand_description TEXT NOT NULL DEFAULT '',
    contact_title TEXT NOT NULL DEFAULT 'Contacto',
    contact_whatsapp_text TEXT NOT NULL DEFAULT '',
    contact_email_text TEXT NOT NULL DEFAULT '',
    contact_hours_text TEXT NOT NULL DEFAULT '',
    location_title TEXT NOT NULL DEFAULT 'Ubicacion',
    location_line1_text TEXT NOT NULL DEFAULT '',
    location_line2_text TEXT NOT NULL DEFAULT '',
    social_title TEXT NOT NULL DEFAULT 'Redes',
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  )`);

  await run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_province TEXT NOT NULL DEFAULT '',
    customer_city TEXT NOT NULL DEFAULT '',
    customer_postal_code TEXT NOT NULL DEFAULT '',
    delivery_type TEXT NOT NULL DEFAULT 'home',
    delivery_branch TEXT NOT NULL DEFAULT '',
    customer_address TEXT,
    notes TEXT,
    total_ars INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  )`);

  await run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    unit_price_ars INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal_ars INTEGER NOT NULL,
    color TEXT NOT NULL DEFAULT '',
    size TEXT NOT NULL DEFAULT '',
    detail_text TEXT NOT NULL DEFAULT '',
    FOREIGN KEY (order_id) REFERENCES orders(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS hero_slides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    alt_text TEXT NOT NULL DEFAULT '',
    title TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    focal_x INTEGER NOT NULL DEFAULT 50,
    focal_y INTEGER NOT NULL DEFAULT 50,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  )`);

  await ensureSchemaMigrations();
  await migrateLegacyUserPasswords();
  await seedDefaultCategories();
  await seedPages();
  await seedHeroSlides();
  await seedDefaultAdminUser();
  await seedSettings();
  await seedFooterSettings();
  await seedProductsIfNeeded();
  await backfillProductAttributesIfNeeded();
  await ensureCategoriesAndImagesFromProducts();
}

async function authenticateUser(username, password) {
  const normalizedUsername = normalizeText(username, 80).toLowerCase();
  const normalizedPassword = normalizeText(password, 120);
  if (!normalizedUsername || !normalizedPassword) return null;

  const user = await get(
    `SELECT id, username, password, full_name as fullName, role, is_active as isActive
     FROM users
     WHERE lower(username) = lower(?)`,
    [normalizedUsername]
  );

  if (!user || !Number(user.isActive)) return null;

  const storedPassword = String(user.password || '');
  let matches = false;

  if (looksLikePasswordHash(storedPassword)) {
    matches = await bcrypt.compare(normalizedPassword, storedPassword);
  } else if (storedPassword) {
    matches = storedPassword === normalizedPassword;
    if (matches) {
      const migratedHash = await hashPassword(normalizedPassword);
      if (migratedHash) {
        await run('UPDATE users SET password = ? WHERE id = ?', [migratedHash, user.id]);
      }
    }
  }

  if (!matches) return null;
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    isActive: user.isActive
  };
}

async function getPageBySlug(slug) {
  const normalizedSlug = normalizeText(slug, 80).toLowerCase();
  if (!normalizedSlug) return null;
  const normalizedLookupSlug = normalizedSlug === 'seguridad' ? 'security' : normalizedSlug;

  const row = await get(
    `SELECT slug, title, image_url as imageUrl, content_html as contentHtml, updated_at as updatedAt
     FROM pages
     WHERE slug = ?`,
    [normalizedLookupSlug]
  );

  if (row) {
    const pageImages = await all(
      `SELECT url, alt_text as altText, focal_x as focalX, focal_y as focalY
       FROM page_images
       WHERE page_id = (SELECT id FROM pages WHERE slug = ? LIMIT 1)
       ORDER BY sort_order ASC, id ASC`,
      [normalizedLookupSlug]
    );
    row.images = buildProductImages(row.imageUrl, pageImages, row.title || normalizedLookupSlug);
    return row;
  }

  // Fallback so `/api/pages/help` never fails even if seed wasn't run yet.
  if (normalizedLookupSlug === 'help') {
    return {
      slug: 'help',
      title: HELP_PAGE_TITLE,
      imageUrl: '',
      contentHtml: HELP_PAGE_CONTENT_HTML,
      images: [],
      updatedAt: null
    };
  }

  if (normalizedLookupSlug === 'security') {
    return {
      slug: 'security',
      title: SECURITY_PAGE_TITLE,
      imageUrl: '',
      contentHtml: SECURITY_PAGE_CONTENT_HTML,
      images: [],
      updatedAt: null
    };
  }

  return null;
}

async function getProducts() {
  const rows = await all(
    `SELECT
      id,
      name,
      category,
      price_ars as priceArs,
      description,
      image_url as imageUrl,
      on_sale as onSale,
      colors as colorsCsv,
      sizes as sizesCsv,
      stock_qty as stockQty,
      detail_text as detailText
     FROM products
     ORDER BY id ASC`
  );

  const categoryRows = await all(
    `SELECT pc.product_id as productId, c.name
     FROM product_categories pc
     JOIN categories c ON c.id = pc.category_id`
  );
  const categoriesByProduct = new Map();
  categoryRows.forEach((row) => {
    const list = categoriesByProduct.get(row.productId) || [];
    list.push(row.name);
    categoriesByProduct.set(row.productId, list);
  });

  const imageRows = await all(
    `SELECT product_id as productId, url, alt_text as altText, focal_x as focalX, focal_y as focalY
     FROM product_images
     ORDER BY product_id, sort_order ASC, id ASC`
  );
  const imagesByProduct = new Map();
  imageRows.forEach((row) => {
    const list = imagesByProduct.get(row.productId) || [];
    list.push({ url: row.url, alt: row.altText, focalX: row.focalX, focalY: row.focalY });
    imagesByProduct.set(row.productId, list);
  });

  return rows.map((row) => {
    const base = formatProductRow(row);
    base.categories = categoriesByProduct.get(row.id) || [row.category];
    base.images = buildProductImages(row.imageUrl, imagesByProduct.get(row.id) || [], row.name);
    const main = base.images[0] || resolveImageWithVariants({ url: row.imageUrl, alt: row.name }, row.name);
    base.imageSliderUrl = main && main.sliderUrl ? main.sliderUrl : row.imageUrl;
    base.imageCardUrl = main && main.cardUrl ? main.cardUrl : row.imageUrl;
    return base;
  });
}

async function getDashboardSummary() {
  const counts = await get(
    `SELECT
      (SELECT COUNT(*) FROM products) as productsCount,
      (SELECT COUNT(*) FROM categories) as categoriesCount,
      (SELECT COUNT(*) FROM orders) as ordersCount,
      (SELECT COUNT(*) FROM product_images) as imagesCount`
  );

  let dbSizeBytes = 0;
  try {
    dbSizeBytes = fs.statSync(dbPath).size || 0;
  } catch (_error) {
    dbSizeBytes = 0;
  }

  return {
    productsCount: Number(counts?.productsCount || 0),
    categoriesCount: Number(counts?.categoriesCount || 0),
    ordersCount: Number(counts?.ordersCount || 0),
    imagesCount: Number(counts?.imagesCount || 0),
    dbSizeBytes
  };
}

async function getProductById(productId) {
  const row = await get(
    `SELECT
      id,
      name,
      category,
      price_ars as priceArs,
      description,
      image_url as imageUrl,
      on_sale as onSale,
      colors as colorsCsv,
      sizes as sizesCsv,
      stock_qty as stockQty,
      detail_text as detailText
     FROM products
     WHERE id = ?`,
    [productId]
  );

  if (!row) return null;

  const categories = await all(
    `SELECT c.name
     FROM product_categories pc
     JOIN categories c ON c.id = pc.category_id
     WHERE pc.product_id = ?`,
    [productId]
  );

  const images = await all(
    `SELECT url, alt_text as altText, focal_x as focalX, focal_y as focalY
     FROM product_images
     WHERE product_id = ?
     ORDER BY sort_order ASC, id ASC`,
    [productId]
  );

  const base = formatProductRow(row);
  base.categories = categories.length ? categories.map((c) => c.name) : [row.category];
  base.images = buildProductImages(row.imageUrl, images, row.name);
  const main = base.images[0] || resolveImageWithVariants({ url: row.imageUrl, alt: row.name }, row.name);
  base.imageSliderUrl = main && main.sliderUrl ? main.sliderUrl : row.imageUrl;
  base.imageCardUrl = main && main.cardUrl ? main.cardUrl : row.imageUrl;
  return base;
}

async function createOrder({ customer, items, whatsappNumber, baseUrl }) {
  const normalizedItems = items
    .map((item) => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity),
      color: normalizeText(item.color),
      size: normalizeText(item.size),
      detailText: normalizeText(item.detail || item.detailText, 300)
    }))
    .filter((item) => Number.isInteger(item.productId) && Number.isInteger(item.quantity) && item.quantity > 0);

  if (!normalizedItems.length) {
    throw new Error('No hay ítems válidos para procesar.');
  }

  const uniqueProductIds = [...new Set(normalizedItems.map((item) => item.productId))];
  const placeholders = uniqueProductIds.map(() => '?').join(',');

  const productRows = await all(
    `SELECT id, name, price_ars, image_url FROM products WHERE id IN (${placeholders})`,
    uniqueProductIds
  );

  if (productRows.length !== uniqueProductIds.length) {
    throw new Error('Uno o más productos ya no están disponibles.');
  }

  const productMap = new Map(productRows.map((product) => [product.id, product]));

  const orderItems = normalizedItems.map((item) => {
    const product = productMap.get(item.productId);
    const subtotal = product.price_ars * item.quantity;
    return {
      productId: product.id,
      name: product.name,
      unitPriceArs: product.price_ars,
      quantity: item.quantity,
      subtotalArs: subtotal,
      color: item.color,
      size: item.size,
      detailText: item.detailText,
      productUrl: buildAbsoluteUrl(baseUrl, `/product.html?id=${product.id}`)
    };
  });

  const itemsTotalArs = orderItems.reduce((sum, item) => sum + item.subtotalArs, 0);
  const shippingArs = SHIPPING_FLAT_ARS;
  const totalArs = itemsTotalArs + shippingArs;
  const customerName = normalizeText(customer?.name, 120);
  const customerPhone = normalizeText(customer?.phone, 80);
  const customerProvince = normalizeText(customer?.province, 80);
  const customerCity = normalizeText(customer?.city, 80);
  const customerPostalCode = normalizeText(customer?.postalCode || customer?.postal_code, 20);
  const deliveryType = normalizeText(customer?.deliveryType, 20).toLowerCase() === 'branch' ? 'branch' : 'home';
  const customerAddress = normalizeText(customer?.address, 200);
  const deliveryBranch = normalizeText(customer?.deliveryBranch || customer?.branch, 160);
  const customerNotes = normalizeText(customer?.notes, 500);

  if (!customerName || !customerPhone) {
    throw new Error('Nombre y telefono son obligatorios.');
  }
  if (!customerProvince || !customerCity) {
    throw new Error('Provincia y ciudad son obligatorias.');
  }
  if (!customerPostalCode) {
    throw new Error('Codigo postal es obligatorio.');
  }
  if (deliveryType === 'home' && !customerAddress) {
    throw new Error('Para envio a domicilio, ingresa direccion de entrega.');
  }
  if (deliveryType === 'branch' && !deliveryBranch) {
    throw new Error('Para envio a sucursal, ingresa la sucursal de Correo Argentino.');
  }

  await run('BEGIN TRANSACTION');
  try {
    const orderInsert = await run(
      `INSERT INTO orders (
        customer_name, customer_phone, customer_province, customer_city, customer_postal_code, delivery_type, delivery_branch, customer_address, notes, total_ars
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerName,
        customerPhone,
        customerProvince,
        customerCity,
        customerPostalCode,
        deliveryType,
        deliveryBranch,
        customerAddress,
        customerNotes,
        totalArs
      ]
    );

    for (const item of orderItems) {
      await run(
        `INSERT INTO order_items (
          order_id, product_id, product_name, unit_price_ars, quantity, subtotal_ars, color, size, detail_text
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderInsert.id,
          item.productId,
          item.name,
          item.unitPriceArs,
          item.quantity,
          item.subtotalArs,
          item.color,
          item.size,
          item.detailText
        ]
      );
    }

    await run('COMMIT');

    const order = {
      id: orderInsert.id,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_province: customerProvince,
      customer_city: customerCity,
      customer_postal_code: customerPostalCode,
      delivery_type: deliveryType,
      delivery_branch: deliveryBranch,
      customer_address: customerAddress,
      customer_notes: customerNotes,
      items_total_ars: itemsTotalArs,
      shipping_ars: shippingArs,
      total_ars: totalArs,
      items: orderItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        subtotal_ars: item.subtotalArs,
        color: item.color,
        size: item.size,
        detail_text: item.detailText,
        product_url: item.productUrl
      }))
    };

    const whatsappText = buildWhatsappMessage(order);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`;

    return {
      orderId: order.id,
      itemsTotalArs,
      shippingArs,
      totalArs: totalArs,
      itemsTotalFormatted: formatCurrency(itemsTotalArs),
      shippingFormatted: formatCurrency(shippingArs),
      totalFormatted: formatCurrency(totalArs),
      whatsappUrl
    };
  } catch (error) {
    await run('ROLLBACK');
    throw error;
  }
}

function normalizeOrderItemsInput(itemsInput) {
  let rawItems = itemsInput;
  if (typeof itemsInput === 'string') {
    const trimmed = itemsInput.trim();
    if (!trimmed) return [];
    try {
      rawItems = JSON.parse(trimmed);
    } catch (_error) {
      throw new Error('El detalle de items no es un JSON valido.');
    }
  }

  if (!Array.isArray(rawItems)) return [];

  return rawItems
    .map((item) => ({
      productId: Number(item?.productId || 0),
      productName: normalizeText(item?.productName || item?.name, 120),
      unitPriceArs: Number(item?.unitPriceArs || item?.unitPrice || 0),
      quantity: Number(item?.quantity || 0),
      subtotalArs: Number(item?.subtotalArs || item?.subtotal || 0),
      color: normalizeText(item?.color, 60),
      size: normalizeText(item?.size, 60),
      detailText: normalizeText(item?.detailText || item?.detail, 300)
    }))
    .filter((item) => item.productName && Number.isFinite(item.quantity) && item.quantity > 0)
    .map((item) => {
      const unit = Number.isFinite(item.unitPriceArs) ? Math.max(0, Math.round(item.unitPriceArs)) : 0;
      const subtotalByQty = unit * Math.max(1, Math.round(item.quantity));
      const subtotal = Number.isFinite(item.subtotalArs) && item.subtotalArs > 0 ? Math.round(item.subtotalArs) : subtotalByQty;
      return {
        ...item,
        unitPriceArs: unit,
        quantity: Math.max(1, Math.round(item.quantity)),
        subtotalArs: Math.max(0, subtotal)
      };
    });
}

async function listOrdersAdmin() {
  const rows = await all(
    `SELECT
      o.id,
      o.customer_name as customerName,
      o.customer_phone as customerPhone,
      o.customer_province as customerProvince,
      o.customer_city as customerCity,
      o.customer_postal_code as customerPostalCode,
      o.delivery_type as deliveryType,
      o.delivery_branch as deliveryBranch,
      o.customer_address as customerAddress,
      o.notes,
      o.total_ars as totalArs,
      o.created_at as createdAt,
      COUNT(oi.id) as itemCount
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     GROUP BY o.id
     ORDER BY o.id DESC`
  );

  for (const row of rows) {
    const items = await all(
      `SELECT
        product_id as productId,
        product_name as productName,
        unit_price_ars as unitPriceArs,
        quantity,
        subtotal_ars as subtotalArs,
        color,
        size,
        detail_text as detailText
       FROM order_items
       WHERE order_id = ?
       ORDER BY id ASC`,
      [row.id]
    );

    row.itemsJson = JSON.stringify(items);
    row.itemsPreview = items.map((item) => `${item.productName} x${item.quantity}`).join(' | ');
  }

  return rows;
}

async function getOrderAdminById(orderId) {
  const normalizedOrderId = Number(orderId);
  if (!Number.isInteger(normalizedOrderId) || normalizedOrderId <= 0) return null;

  const row = await get(
    `SELECT
      o.id,
      o.customer_name as customerName,
      o.customer_phone as customerPhone,
      o.customer_province as customerProvince,
      o.customer_city as customerCity,
      o.customer_postal_code as customerPostalCode,
      o.delivery_type as deliveryType,
      o.delivery_branch as deliveryBranch,
      o.customer_address as customerAddress,
      o.notes,
      o.total_ars as totalArs,
      o.created_at as createdAt
     FROM orders o
     WHERE o.id = ?
     LIMIT 1`,
    [normalizedOrderId]
  );
  if (!row) return null;

  const items = await all(
    `SELECT
      oi.product_id as productId,
      oi.product_name as productName,
      oi.unit_price_ars as unitPriceArs,
      oi.quantity,
      oi.subtotal_ars as subtotalArs,
      oi.color,
      oi.size,
      oi.detail_text as detailText,
      p.image_url as productImageUrl
     FROM order_items oi
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = ?
     ORDER BY oi.id ASC`,
    [normalizedOrderId]
  );

  return {
    ...row,
    itemCount: items.length,
    itemsPreview: items.map((item) => `${item.productName} x${item.quantity}`).join(' | '),
    itemsJson: JSON.stringify(items),
    items
  };
}

async function createOrderAdmin({
  customerName,
  customerPhone,
  customerProvince,
  customerCity,
  customerPostalCode,
  deliveryType,
  deliveryBranch,
  customerAddress,
  notes,
  totalArs,
  itemsJson
}) {
  const normalizedCustomerName = normalizeText(customerName, 120);
  const normalizedCustomerPhone = normalizeText(customerPhone, 80);
  const normalizedCustomerProvince = normalizeText(customerProvince, 80);
  const normalizedCustomerCity = normalizeText(customerCity, 80);
  const normalizedCustomerPostalCode = normalizeText(customerPostalCode, 20);
  const normalizedDeliveryType = normalizeText(deliveryType, 20).toLowerCase() === 'branch' ? 'branch' : 'home';
  const normalizedDeliveryBranch = normalizeText(deliveryBranch, 160);
  const normalizedCustomerAddress = normalizeText(customerAddress, 200);
  const normalizedNotes = normalizeText(notes, 500);
  const normalizedItems = normalizeOrderItemsInput(itemsJson);

  if (!normalizedCustomerName || !normalizedCustomerPhone) {
    throw new Error('Nombre y telefono son obligatorios.');
  }
  if (!normalizedCustomerProvince || !normalizedCustomerCity) {
    throw new Error('Provincia y ciudad son obligatorias.');
  }
  if (!normalizedCustomerPostalCode) {
    throw new Error('Codigo postal es obligatorio.');
  }
  if (normalizedDeliveryType === 'home' && !normalizedCustomerAddress) {
    throw new Error('Para envio a domicilio, ingresa direccion.');
  }
  if (normalizedDeliveryType === 'branch' && !normalizedDeliveryBranch) {
    throw new Error('Para envio a sucursal, ingresa sucursal de Correo Argentino.');
  }

  const providedTotal = Number(totalArs);
  const computedTotal = normalizedItems.reduce((sum, item) => sum + item.subtotalArs, 0);
  const nextTotalArs =
    normalizedItems.length > 0
      ? computedTotal
      : Number.isFinite(providedTotal) && providedTotal >= 0
        ? Math.round(providedTotal)
        : 0;

  await run('BEGIN TRANSACTION');
  try {
    const inserted = await run(
      `INSERT INTO orders (
        customer_name, customer_phone, customer_province, customer_city, customer_postal_code, delivery_type, delivery_branch, customer_address, notes, total_ars
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        normalizedCustomerName,
        normalizedCustomerPhone,
        normalizedCustomerProvince,
        normalizedCustomerCity,
        normalizedCustomerPostalCode,
        normalizedDeliveryType,
        normalizedDeliveryBranch,
        normalizedCustomerAddress,
        normalizedNotes,
        nextTotalArs
      ]
    );

    for (const item of normalizedItems) {
      await run(
        `INSERT INTO order_items (
          order_id, product_id, product_name, unit_price_ars, quantity, subtotal_ars, color, size, detail_text
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          inserted.id,
          Number.isInteger(item.productId) && item.productId > 0 ? item.productId : 0,
          item.productName,
          item.unitPriceArs,
          item.quantity,
          item.subtotalArs,
          item.color,
          item.size,
          item.detailText
        ]
      );
    }

    await run('COMMIT');
    const rows = await listOrdersAdmin();
    return rows.find((row) => Number(row.id) === Number(inserted.id)) || null;
  } catch (error) {
    await run('ROLLBACK');
    throw error;
  }
}

async function updateOrderAdmin(
  orderId,
  { customerName, customerPhone, customerProvince, customerCity, customerPostalCode, deliveryType, deliveryBranch, customerAddress, notes, totalArs, itemsJson }
) {
  const current = await get('SELECT * FROM orders WHERE id = ?', [orderId]);
  if (!current) return null;

  const normalizedCustomerName = normalizeText(customerName ?? current.customer_name, 120);
  const normalizedCustomerPhone = normalizeText(customerPhone ?? current.customer_phone, 80);
  const normalizedCustomerProvince = normalizeText(customerProvince ?? current.customer_province, 80);
  const normalizedCustomerCity = normalizeText(customerCity ?? current.customer_city, 80);
  const normalizedCustomerPostalCode = normalizeText(customerPostalCode ?? current.customer_postal_code, 20);
  const normalizedDeliveryType = normalizeText(deliveryType ?? current.delivery_type, 20).toLowerCase() === 'branch' ? 'branch' : 'home';
  const normalizedDeliveryBranch = normalizeText(deliveryBranch ?? current.delivery_branch, 160);
  const normalizedCustomerAddress = normalizeText(customerAddress ?? current.customer_address, 200);
  const normalizedNotes = normalizeText(notes ?? current.notes, 500);

  if (!normalizedCustomerName || !normalizedCustomerPhone) {
    throw new Error('Nombre y telefono son obligatorios.');
  }
  if (!normalizedCustomerProvince || !normalizedCustomerCity) {
    throw new Error('Provincia y ciudad son obligatorias.');
  }
  if (!normalizedCustomerPostalCode) {
    throw new Error('Codigo postal es obligatorio.');
  }
  if (normalizedDeliveryType === 'home' && !normalizedCustomerAddress) {
    throw new Error('Para envio a domicilio, ingresa direccion.');
  }
  if (normalizedDeliveryType === 'branch' && !normalizedDeliveryBranch) {
    throw new Error('Para envio a sucursal, ingresa sucursal de Correo Argentino.');
  }

  const itemsWasProvided = itemsJson !== undefined;
  const normalizedItems = itemsWasProvided ? normalizeOrderItemsInput(itemsJson) : null;
  const providedTotal = Number(totalArs);
  let nextTotalArs = Number(current.total_ars || 0);

  if (itemsWasProvided) {
    nextTotalArs = normalizedItems.reduce((sum, item) => sum + item.subtotalArs, 0);
  } else if (totalArs !== undefined && Number.isFinite(providedTotal) && providedTotal >= 0) {
    nextTotalArs = Math.round(providedTotal);
  }

  await run('BEGIN TRANSACTION');
  try {
    await run(
      `UPDATE orders
       SET customer_name = ?, customer_phone = ?, customer_province = ?, customer_city = ?, customer_postal_code = ?, delivery_type = ?, delivery_branch = ?, customer_address = ?, notes = ?, total_ars = ?
       WHERE id = ?`,
      [
        normalizedCustomerName,
        normalizedCustomerPhone,
        normalizedCustomerProvince,
        normalizedCustomerCity,
        normalizedCustomerPostalCode,
        normalizedDeliveryType,
        normalizedDeliveryBranch,
        normalizedCustomerAddress,
        normalizedNotes,
        nextTotalArs,
        orderId
      ]
    );

    if (itemsWasProvided) {
      await run('DELETE FROM order_items WHERE order_id = ?', [orderId]);
      for (const item of normalizedItems) {
        await run(
          `INSERT INTO order_items (
            order_id, product_id, product_name, unit_price_ars, quantity, subtotal_ars, color, size, detail_text
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            Number.isInteger(item.productId) && item.productId > 0 ? item.productId : 0,
            item.productName,
            item.unitPriceArs,
            item.quantity,
            item.subtotalArs,
            item.color,
            item.size,
            item.detailText
          ]
        );
      }
    }

    await run('COMMIT');
    const rows = await listOrdersAdmin();
    return rows.find((row) => Number(row.id) === Number(orderId)) || null;
  } catch (error) {
    await run('ROLLBACK');
    throw error;
  }
}

async function deleteOrderAdmin(orderId) {
  await run('BEGIN TRANSACTION');
  try {
    await run('DELETE FROM order_items WHERE order_id = ?', [orderId]);
    const result = await run('DELETE FROM orders WHERE id = ?', [orderId]);
    await run('COMMIT');
    return result.changes > 0;
  } catch (error) {
    await run('ROLLBACK');
    throw error;
  }
}

async function getSettings() {
  const row = await get(
    `SELECT
      id,
      store_name as storeName,
      store_logo_url as storeLogoUrl,
      store_favicon_url as storeFaviconUrl,
      whatsapp_number as whatsappNumber,
      social_instagram_url as socialInstagramUrl,
      social_facebook_url as socialFacebookUrl,
      social_youtube_url as socialYoutubeUrl,
      social_x_url as socialXUrl,
      template_social_instagram_url as templateSocialInstagramUrl,
      template_social_facebook_url as templateSocialFacebookUrl,
      template_social_youtube_url as templateSocialYoutubeUrl,
      template_social_x_url as templateSocialXUrl,
      template_heading_font as templateHeadingFont,
      template_body_font as templateBodyFont,
      template_heading_color as templateHeadingColor,
      template_body_color as templateBodyColor,
      template_heading_scale as templateHeadingScale,
      template_heading_size_px as templateHeadingSizePx,
      template_body_size_px as templateBodySizePx,
      template_google_analytics_id as templateGoogleAnalyticsId,
      seo_social_meta_enabled as seoSocialMetaEnabled,
      seo_html_meta_enabled as seoHtmlMetaEnabled,
      seo_open_graph_enabled as seoOpenGraphEnabled,
      seo_twitter_cards_enabled as seoTwitterCardsEnabled,
      seo_advanced_tags_enabled as seoAdvancedTagsEnabled,
      seo_schema_markup_enabled as seoSchemaMarkupEnabled,
      seo_html_default_title as seoHtmlDefaultTitle,
      seo_html_default_description as seoHtmlDefaultDescription,
      seo_html_default_keywords as seoHtmlDefaultKeywords,
      seo_html_author as seoHtmlAuthor,
      seo_html_robots_index_enabled as seoHtmlRobotsIndexEnabled,
      seo_html_robots_follow_enabled as seoHtmlRobotsFollowEnabled,
      seo_html_content_language as seoHtmlContentLanguage,
      seo_html_geo_region as seoHtmlGeoRegion,
      seo_html_geo_placename as seoHtmlGeoPlaceName,
      seo_html_geo_position as seoHtmlGeoPosition,
      seo_og_default_title as seoOgDefaultTitle,
      seo_og_default_description as seoOgDefaultDescription,
      seo_og_images_json as seoOgImagesJson,
      seo_og_url as seoOgUrl,
      seo_og_type as seoOgType,
      seo_og_site_name as seoOgSiteName,
      seo_og_locale as seoOgLocale,
      seo_twitter_card_type as seoTwitterCardType,
      seo_twitter_title as seoTwitterTitle,
      seo_twitter_description as seoTwitterDescription,
      seo_twitter_image_url as seoTwitterImageUrl,
      seo_twitter_site_handle as seoTwitterSiteHandle,
      seo_twitter_creator_handle as seoTwitterCreatorHandle,
      seo_advanced_canonical_url as seoAdvancedCanonicalUrl,
      seo_advanced_noarchive_enabled as seoAdvancedNoArchiveEnabled,
      seo_advanced_nosnippet_enabled as seoAdvancedNoSnippetEnabled,
      seo_advanced_noimageindex_enabled as seoAdvancedNoImageIndexEnabled,
      seo_advanced_max_snippet as seoAdvancedMaxSnippet,
      seo_advanced_max_image_preview as seoAdvancedMaxImagePreview,
      seo_advanced_max_video_preview as seoAdvancedMaxVideoPreview,
      seo_advanced_unavailable_after as seoAdvancedUnavailableAfter,
      seo_advanced_googlebot_rules as seoAdvancedGooglebotRules,
      seo_advanced_googlebot_news_rules as seoAdvancedGooglebotNewsRules,
      seo_advanced_hreflang_json as seoAdvancedHreflangJson,
      seo_schema_type as seoSchemaType,
      seo_schema_name as seoSchemaName,
      seo_schema_description as seoSchemaDescription,
      seo_schema_image_url as seoSchemaImageUrl,
      seo_schema_url as seoSchemaUrl,
      seo_schema_author as seoSchemaAuthor,
      seo_schema_date_published as seoSchemaDatePublished,
      seo_schema_headline as seoSchemaHeadline,
      seo_google_2026_enabled as seoGoogle2026Enabled,
      seo_google_2026_agency_name as seoGoogle2026AgencyName,
      seo_google_2026_rollout_window_enabled as seoGoogle2026RolloutWindowEnabled,
      seo_google_2026_rollout_window as seoGoogle2026RolloutWindow,
      seo_google_2026_technical_seo_enabled as seoGoogle2026TechnicalSeoEnabled,
      seo_google_2026_technical_seo as seoGoogle2026TechnicalSeo,
      seo_google_2026_core_web_vitals_enabled as seoGoogle2026CoreWebVitalsEnabled,
      seo_google_2026_core_web_vitals as seoGoogle2026CoreWebVitals,
      seo_google_2026_content_quality_enabled as seoGoogle2026ContentQualityEnabled,
      seo_google_2026_content_quality as seoGoogle2026ContentQuality,
      seo_google_2026_security_maintenance_enabled as seoGoogle2026SecurityMaintenanceEnabled,
      seo_google_2026_security_maintenance as seoGoogle2026SecurityMaintenance,
      seo_google_2026_local_authority_enabled as seoGoogle2026LocalAuthorityEnabled,
      seo_google_2026_local_authority as seoGoogle2026LocalAuthority,
      seo_google_2026_user_experience_enabled as seoGoogle2026UserExperienceEnabled,
      seo_google_2026_user_experience as seoGoogle2026UserExperience,
      seo_google_2026_competitive_advantage_enabled as seoGoogle2026CompetitiveAdvantageEnabled,
      seo_google_2026_competitive_advantage as seoGoogle2026CompetitiveAdvantage,
      seo_images_module_enabled as seoImagesModuleEnabled,
      seo_images_file_names_enabled as seoImagesFileNamesEnabled,
      seo_images_file_names as seoImagesFileNames,
      seo_images_resize_enabled as seoImagesResizeEnabled,
      seo_images_resize as seoImagesResize,
      seo_images_compression_enabled as seoImagesCompressionEnabled,
      seo_images_compression as seoImagesCompression,
      seo_images_format_enabled as seoImagesFormatEnabled,
      seo_images_format as seoImagesFormat,
      seo_images_sitemap_enabled as seoImagesSitemapEnabled,
      seo_images_sitemap as seoImagesSitemap,
      seo_images_cdn_enabled as seoImagesCdnEnabled,
      seo_images_cdn as seoImagesCdn,
      seo_images_lazy_loading_enabled as seoImagesLazyLoadingEnabled,
      seo_images_lazy_loading as seoImagesLazyLoading,
      seo_images_browser_cache_enabled as seoImagesBrowserCacheEnabled,
      seo_images_browser_cache as seoImagesBrowserCache,
      seo_images_structured_data_enabled as seoImagesStructuredDataEnabled,
      seo_images_structured_data as seoImagesStructuredData,
      seo_images_social_tags_enabled as seoImagesSocialTagsEnabled,
      seo_images_social_tags as seoImagesSocialTags,
      seo_images_audit_enabled as seoImagesAuditEnabled,
      seo_images_audit as seoImagesAudit,
      seo_tech_files_enabled as seoTechFilesEnabled,
      seo_sitemap_generator_enabled as seoSitemapGeneratorEnabled,
      seo_sitemap_generator_notes as seoSitemapGeneratorNotes,
      seo_robots_txt_enabled as seoRobotsTxtEnabled,
      seo_robots_txt_content as seoRobotsTxtContent,
      seo_htaccess_enabled as seoHtaccessEnabled,
      seo_htaccess_content as seoHtaccessContent,
      updated_at as updatedAt
     FROM settings
     WHERE id = 1`
  );

  if (row) return row;

  await seedSettings();
  return get(
    `SELECT
      id,
      store_name as storeName,
      store_logo_url as storeLogoUrl,
      store_favicon_url as storeFaviconUrl,
      whatsapp_number as whatsappNumber,
      social_instagram_url as socialInstagramUrl,
      social_facebook_url as socialFacebookUrl,
      social_youtube_url as socialYoutubeUrl,
      social_x_url as socialXUrl,
      template_social_instagram_url as templateSocialInstagramUrl,
      template_social_facebook_url as templateSocialFacebookUrl,
      template_social_youtube_url as templateSocialYoutubeUrl,
      template_social_x_url as templateSocialXUrl,
      template_heading_font as templateHeadingFont,
      template_body_font as templateBodyFont,
      template_heading_color as templateHeadingColor,
      template_body_color as templateBodyColor,
      template_heading_scale as templateHeadingScale,
      template_heading_size_px as templateHeadingSizePx,
      template_body_size_px as templateBodySizePx,
      template_google_analytics_id as templateGoogleAnalyticsId,
      seo_social_meta_enabled as seoSocialMetaEnabled,
      seo_html_meta_enabled as seoHtmlMetaEnabled,
      seo_open_graph_enabled as seoOpenGraphEnabled,
      seo_twitter_cards_enabled as seoTwitterCardsEnabled,
      seo_advanced_tags_enabled as seoAdvancedTagsEnabled,
      seo_schema_markup_enabled as seoSchemaMarkupEnabled,
      seo_html_default_title as seoHtmlDefaultTitle,
      seo_html_default_description as seoHtmlDefaultDescription,
      seo_html_default_keywords as seoHtmlDefaultKeywords,
      seo_html_author as seoHtmlAuthor,
      seo_html_robots_index_enabled as seoHtmlRobotsIndexEnabled,
      seo_html_robots_follow_enabled as seoHtmlRobotsFollowEnabled,
      seo_html_content_language as seoHtmlContentLanguage,
      seo_html_geo_region as seoHtmlGeoRegion,
      seo_html_geo_placename as seoHtmlGeoPlaceName,
      seo_html_geo_position as seoHtmlGeoPosition,
      seo_og_default_title as seoOgDefaultTitle,
      seo_og_default_description as seoOgDefaultDescription,
      seo_og_images_json as seoOgImagesJson,
      seo_og_url as seoOgUrl,
      seo_og_type as seoOgType,
      seo_og_site_name as seoOgSiteName,
      seo_og_locale as seoOgLocale,
      seo_twitter_card_type as seoTwitterCardType,
      seo_twitter_title as seoTwitterTitle,
      seo_twitter_description as seoTwitterDescription,
      seo_twitter_image_url as seoTwitterImageUrl,
      seo_twitter_site_handle as seoTwitterSiteHandle,
      seo_twitter_creator_handle as seoTwitterCreatorHandle,
      seo_advanced_canonical_url as seoAdvancedCanonicalUrl,
      seo_advanced_noarchive_enabled as seoAdvancedNoArchiveEnabled,
      seo_advanced_nosnippet_enabled as seoAdvancedNoSnippetEnabled,
      seo_advanced_noimageindex_enabled as seoAdvancedNoImageIndexEnabled,
      seo_advanced_max_snippet as seoAdvancedMaxSnippet,
      seo_advanced_max_image_preview as seoAdvancedMaxImagePreview,
      seo_advanced_max_video_preview as seoAdvancedMaxVideoPreview,
      seo_advanced_unavailable_after as seoAdvancedUnavailableAfter,
      seo_advanced_googlebot_rules as seoAdvancedGooglebotRules,
      seo_advanced_googlebot_news_rules as seoAdvancedGooglebotNewsRules,
      seo_advanced_hreflang_json as seoAdvancedHreflangJson,
      seo_schema_type as seoSchemaType,
      seo_schema_name as seoSchemaName,
      seo_schema_description as seoSchemaDescription,
      seo_schema_image_url as seoSchemaImageUrl,
      seo_schema_url as seoSchemaUrl,
      seo_schema_author as seoSchemaAuthor,
      seo_schema_date_published as seoSchemaDatePublished,
      seo_schema_headline as seoSchemaHeadline,
      seo_google_2026_enabled as seoGoogle2026Enabled,
      seo_google_2026_agency_name as seoGoogle2026AgencyName,
      seo_google_2026_rollout_window_enabled as seoGoogle2026RolloutWindowEnabled,
      seo_google_2026_rollout_window as seoGoogle2026RolloutWindow,
      seo_google_2026_technical_seo_enabled as seoGoogle2026TechnicalSeoEnabled,
      seo_google_2026_technical_seo as seoGoogle2026TechnicalSeo,
      seo_google_2026_core_web_vitals_enabled as seoGoogle2026CoreWebVitalsEnabled,
      seo_google_2026_core_web_vitals as seoGoogle2026CoreWebVitals,
      seo_google_2026_content_quality_enabled as seoGoogle2026ContentQualityEnabled,
      seo_google_2026_content_quality as seoGoogle2026ContentQuality,
      seo_google_2026_security_maintenance_enabled as seoGoogle2026SecurityMaintenanceEnabled,
      seo_google_2026_security_maintenance as seoGoogle2026SecurityMaintenance,
      seo_google_2026_local_authority_enabled as seoGoogle2026LocalAuthorityEnabled,
      seo_google_2026_local_authority as seoGoogle2026LocalAuthority,
      seo_google_2026_user_experience_enabled as seoGoogle2026UserExperienceEnabled,
      seo_google_2026_user_experience as seoGoogle2026UserExperience,
      seo_google_2026_competitive_advantage_enabled as seoGoogle2026CompetitiveAdvantageEnabled,
      seo_google_2026_competitive_advantage as seoGoogle2026CompetitiveAdvantage,
      seo_images_module_enabled as seoImagesModuleEnabled,
      seo_images_file_names_enabled as seoImagesFileNamesEnabled,
      seo_images_file_names as seoImagesFileNames,
      seo_images_resize_enabled as seoImagesResizeEnabled,
      seo_images_resize as seoImagesResize,
      seo_images_compression_enabled as seoImagesCompressionEnabled,
      seo_images_compression as seoImagesCompression,
      seo_images_format_enabled as seoImagesFormatEnabled,
      seo_images_format as seoImagesFormat,
      seo_images_sitemap_enabled as seoImagesSitemapEnabled,
      seo_images_sitemap as seoImagesSitemap,
      seo_images_cdn_enabled as seoImagesCdnEnabled,
      seo_images_cdn as seoImagesCdn,
      seo_images_lazy_loading_enabled as seoImagesLazyLoadingEnabled,
      seo_images_lazy_loading as seoImagesLazyLoading,
      seo_images_browser_cache_enabled as seoImagesBrowserCacheEnabled,
      seo_images_browser_cache as seoImagesBrowserCache,
      seo_images_structured_data_enabled as seoImagesStructuredDataEnabled,
      seo_images_structured_data as seoImagesStructuredData,
      seo_images_social_tags_enabled as seoImagesSocialTagsEnabled,
      seo_images_social_tags as seoImagesSocialTags,
      seo_images_audit_enabled as seoImagesAuditEnabled,
      seo_images_audit as seoImagesAudit,
      seo_tech_files_enabled as seoTechFilesEnabled,
      seo_sitemap_generator_enabled as seoSitemapGeneratorEnabled,
      seo_sitemap_generator_notes as seoSitemapGeneratorNotes,
      seo_robots_txt_enabled as seoRobotsTxtEnabled,
      seo_robots_txt_content as seoRobotsTxtContent,
      seo_htaccess_enabled as seoHtaccessEnabled,
      seo_htaccess_content as seoHtaccessContent,
      updated_at as updatedAt
     FROM settings
     WHERE id = 1`
  );
}

async function listSettings() {
  const settings = await getSettings();
  return settings ? [settings] : [];
}

async function updateSettings({
  storeName,
  storeLogoUrl,
  storeFaviconUrl,
  whatsappNumber,
  socialInstagramUrl,
  socialFacebookUrl,
  socialYoutubeUrl,
  socialXUrl,
  templateSocialInstagramUrl,
  templateSocialFacebookUrl,
  templateSocialYoutubeUrl,
  templateSocialXUrl,
  templateHeadingFont,
  templateBodyFont,
  templateHeadingColor,
  templateBodyColor,
  templateHeadingScale,
  templateHeadingSizePx,
  templateBodySizePx,
  templateGoogleAnalyticsId,
  seoSocialMetaEnabled,
  seoHtmlMetaEnabled,
  seoOpenGraphEnabled,
  seoTwitterCardsEnabled,
  seoAdvancedTagsEnabled,
  seoSchemaMarkupEnabled,
  seoHtmlDefaultTitle,
  seoHtmlDefaultDescription,
  seoHtmlDefaultKeywords,
  seoHtmlAuthor,
  seoHtmlRobotsIndexEnabled,
  seoHtmlRobotsFollowEnabled,
  seoHtmlContentLanguage,
  seoHtmlGeoRegion,
  seoHtmlGeoPlaceName,
  seoHtmlGeoPosition,
  seoOgDefaultTitle,
  seoOgDefaultDescription,
  seoOgImagesJson,
  seoOgUrl,
  seoOgType,
  seoOgSiteName,
  seoOgLocale,
  seoTwitterCardType,
  seoTwitterTitle,
  seoTwitterDescription,
  seoTwitterImageUrl,
  seoTwitterSiteHandle,
  seoTwitterCreatorHandle,
  seoAdvancedCanonicalUrl,
  seoAdvancedNoArchiveEnabled,
  seoAdvancedNoSnippetEnabled,
  seoAdvancedNoImageIndexEnabled,
  seoAdvancedMaxSnippet,
  seoAdvancedMaxImagePreview,
  seoAdvancedMaxVideoPreview,
  seoAdvancedUnavailableAfter,
  seoAdvancedGooglebotRules,
  seoAdvancedGooglebotNewsRules,
  seoAdvancedHreflangJson,
  seoSchemaType,
  seoSchemaName,
  seoSchemaDescription,
  seoSchemaImageUrl,
  seoSchemaUrl,
  seoSchemaAuthor,
  seoSchemaDatePublished,
  seoSchemaHeadline,
  seoGoogle2026Enabled,
  seoGoogle2026AgencyName,
  seoGoogle2026RolloutWindowEnabled,
  seoGoogle2026RolloutWindow,
  seoGoogle2026TechnicalSeoEnabled,
  seoGoogle2026TechnicalSeo,
  seoGoogle2026CoreWebVitalsEnabled,
  seoGoogle2026CoreWebVitals,
  seoGoogle2026ContentQualityEnabled,
  seoGoogle2026ContentQuality,
  seoGoogle2026SecurityMaintenanceEnabled,
  seoGoogle2026SecurityMaintenance,
  seoGoogle2026LocalAuthorityEnabled,
  seoGoogle2026LocalAuthority,
  seoGoogle2026UserExperienceEnabled,
  seoGoogle2026UserExperience,
  seoGoogle2026CompetitiveAdvantageEnabled,
  seoGoogle2026CompetitiveAdvantage,
  seoImagesModuleEnabled,
  seoImagesFileNamesEnabled,
  seoImagesFileNames,
  seoImagesResizeEnabled,
  seoImagesResize,
  seoImagesCompressionEnabled,
  seoImagesCompression,
  seoImagesFormatEnabled,
  seoImagesFormat,
  seoImagesSitemapEnabled,
  seoImagesSitemap,
  seoImagesCdnEnabled,
  seoImagesCdn,
  seoImagesLazyLoadingEnabled,
  seoImagesLazyLoading,
  seoImagesBrowserCacheEnabled,
  seoImagesBrowserCache,
  seoImagesStructuredDataEnabled,
  seoImagesStructuredData,
  seoImagesSocialTagsEnabled,
  seoImagesSocialTags,
  seoImagesAuditEnabled,
  seoImagesAudit,
  seoTechFilesEnabled,
  seoSitemapGeneratorEnabled,
  seoSitemapGeneratorNotes,
  seoRobotsTxtEnabled,
  seoRobotsTxtContent,
  seoHtaccessEnabled,
  seoHtaccessContent
}) {
  const current = await getSettings();
  if (!current) {
    throw new Error('No se pudo cargar configuración.');
  }

  const nextStoreName = normalizeText(storeName ?? current.storeName, 120);
  const nextStoreLogoUrl = normalizeText(storeLogoUrl ?? current.storeLogoUrl, 1000);
  const nextStoreFaviconUrl = normalizeText(storeFaviconUrl ?? current.storeFaviconUrl, 1000);
  const nextWhatsappNumber = normalizeWhatsappNumber(whatsappNumber ?? current.whatsappNumber);
  const nextSocialInstagramUrl = normalizeText(socialInstagramUrl ?? current.socialInstagramUrl, 1000);
  const nextSocialFacebookUrl = normalizeText(socialFacebookUrl ?? current.socialFacebookUrl, 1000);
  const nextSocialYoutubeUrl = normalizeText(socialYoutubeUrl ?? current.socialYoutubeUrl, 1000);
  const nextSocialXUrl = normalizeText(socialXUrl ?? current.socialXUrl, 1000);
  const nextTemplateSocialInstagramUrl = normalizeText(
    templateSocialInstagramUrl ?? current.templateSocialInstagramUrl ?? current.socialInstagramUrl,
    1000
  );
  const nextTemplateSocialFacebookUrl = normalizeText(
    templateSocialFacebookUrl ?? current.templateSocialFacebookUrl ?? current.socialFacebookUrl,
    1000
  );
  const nextTemplateSocialYoutubeUrl = normalizeText(
    templateSocialYoutubeUrl ?? current.templateSocialYoutubeUrl ?? current.socialYoutubeUrl,
    1000
  );
  const nextTemplateSocialXUrl = normalizeText(
    templateSocialXUrl ?? current.templateSocialXUrl ?? current.socialXUrl,
    1000
  );
  const nextTemplateHeadingFont = normalizeTemplateFontChoice(
    templateHeadingFont ?? current.templateHeadingFont,
    DEFAULT_TEMPLATE_HEADING_FONT
  );
  const nextTemplateBodyFont = normalizeTemplateFontChoice(
    templateBodyFont ?? current.templateBodyFont,
    DEFAULT_TEMPLATE_BODY_FONT
  );
  const nextTemplateHeadingColor = normalizeHexColor(
    templateHeadingColor ?? current.templateHeadingColor,
    DEFAULT_TEMPLATE_HEADING_COLOR
  );
  const nextTemplateBodyColor = normalizeHexColor(
    templateBodyColor ?? current.templateBodyColor,
    DEFAULT_TEMPLATE_BODY_COLOR
  );
  const nextTemplateHeadingScale = normalizeTemplateHeadingScale(
    templateHeadingScale ?? current.templateHeadingScale,
    DEFAULT_TEMPLATE_HEADING_SCALE
  );
  const nextTemplateHeadingSizePx = normalizeTemplateHeadingSizePx(
    templateHeadingSizePx ?? current.templateHeadingSizePx,
    DEFAULT_TEMPLATE_HEADING_SIZE_PX
  );
  const nextTemplateBodySizePx = normalizeTemplateBodySizePx(
    templateBodySizePx ?? current.templateBodySizePx,
    DEFAULT_TEMPLATE_BODY_SIZE_PX
  );
  const nextTemplateGoogleAnalyticsId = normalizeGoogleAnalyticsId(
    templateGoogleAnalyticsId ?? current.templateGoogleAnalyticsId
  );
  let nextSeoSocialMetaEnabled =
    seoSocialMetaEnabled === undefined ? Number(current.seoSocialMetaEnabled) : Number(seoSocialMetaEnabled) ? 1 : 0;
  const nextSeoHtmlMetaEnabled =
    seoHtmlMetaEnabled === undefined ? Number(current.seoHtmlMetaEnabled) : Number(seoHtmlMetaEnabled) ? 1 : 0;
  const nextSeoOpenGraphEnabled =
    seoOpenGraphEnabled === undefined ? Number(current.seoOpenGraphEnabled) : Number(seoOpenGraphEnabled) ? 1 : 0;
  const nextSeoTwitterCardsEnabled =
    seoTwitterCardsEnabled === undefined
      ? Number(current.seoTwitterCardsEnabled)
      : Number(seoTwitterCardsEnabled)
        ? 1
        : 0;
  const nextSeoAdvancedTagsEnabled =
    seoAdvancedTagsEnabled === undefined ? Number(current.seoAdvancedTagsEnabled) : Number(seoAdvancedTagsEnabled) ? 1 : 0;
  const nextSeoSchemaMarkupEnabled =
    seoSchemaMarkupEnabled === undefined ? Number(current.seoSchemaMarkupEnabled) : Number(seoSchemaMarkupEnabled) ? 1 : 0;
  const nextSeoHtmlDefaultTitle = normalizeText(seoHtmlDefaultTitle ?? current.seoHtmlDefaultTitle, 160);
  const nextSeoHtmlDefaultDescription = normalizeText(seoHtmlDefaultDescription ?? current.seoHtmlDefaultDescription, 320);
  const nextSeoHtmlDefaultKeywords = normalizeText(seoHtmlDefaultKeywords ?? current.seoHtmlDefaultKeywords, 320);
  const nextSeoHtmlAuthor = normalizeText(seoHtmlAuthor ?? current.seoHtmlAuthor, 120);
  const nextSeoHtmlRobotsIndexEnabled =
    seoHtmlRobotsIndexEnabled === undefined
      ? Number(current.seoHtmlRobotsIndexEnabled)
      : Number(seoHtmlRobotsIndexEnabled)
        ? 1
        : 0;
  const nextSeoHtmlRobotsFollowEnabled =
    seoHtmlRobotsFollowEnabled === undefined
      ? Number(current.seoHtmlRobotsFollowEnabled)
      : Number(seoHtmlRobotsFollowEnabled)
        ? 1
        : 0;
  const nextSeoHtmlContentLanguage = normalizeContentLanguage(seoHtmlContentLanguage ?? current.seoHtmlContentLanguage);
  const nextSeoHtmlGeoRegion = normalizeGeoRegion(seoHtmlGeoRegion ?? current.seoHtmlGeoRegion);
  const nextSeoHtmlGeoPlaceName = normalizeText(seoHtmlGeoPlaceName ?? current.seoHtmlGeoPlaceName, 120);
  const nextSeoHtmlGeoPosition = normalizeGeoPosition(seoHtmlGeoPosition ?? current.seoHtmlGeoPosition);
  const nextSeoOgDefaultTitle = normalizeText(seoOgDefaultTitle ?? current.seoOgDefaultTitle, 160);
  const nextSeoOgDefaultDescription = normalizeText(seoOgDefaultDescription ?? current.seoOgDefaultDescription, 320);
  const nextSeoOgImagesJson = stringifyOgImages(seoOgImagesJson ?? current.seoOgImagesJson);
  const nextSeoOgUrl = normalizeUrl(seoOgUrl ?? current.seoOgUrl, 1000);
  const nextSeoOgType = normalizeOgType(seoOgType ?? current.seoOgType);
  const nextSeoOgSiteName = normalizeText(seoOgSiteName ?? current.seoOgSiteName, 120);
  const nextSeoOgLocale = normalizeOgLocale(seoOgLocale ?? current.seoOgLocale);
  const nextSeoTwitterCardType = normalizeTwitterCardType(seoTwitterCardType ?? current.seoTwitterCardType);
  const nextSeoTwitterTitle = normalizeText(seoTwitterTitle ?? current.seoTwitterTitle, 70);
  const nextSeoTwitterDescription = normalizeText(seoTwitterDescription ?? current.seoTwitterDescription, 200);
  const nextSeoTwitterImageUrl = normalizeUrl(seoTwitterImageUrl ?? current.seoTwitterImageUrl, 1000);
  const nextSeoTwitterSiteHandle = normalizeTwitterHandle(seoTwitterSiteHandle ?? current.seoTwitterSiteHandle);
  const nextSeoTwitterCreatorHandle = normalizeTwitterHandle(seoTwitterCreatorHandle ?? current.seoTwitterCreatorHandle);
  const nextSeoAdvancedCanonicalUrl = normalizeUrl(seoAdvancedCanonicalUrl ?? current.seoAdvancedCanonicalUrl, 1000);
  const nextSeoAdvancedNoArchiveEnabled =
    seoAdvancedNoArchiveEnabled === undefined
      ? Number(current.seoAdvancedNoArchiveEnabled)
      : Number(seoAdvancedNoArchiveEnabled)
        ? 1
        : 0;
  const nextSeoAdvancedNoSnippetEnabled =
    seoAdvancedNoSnippetEnabled === undefined
      ? Number(current.seoAdvancedNoSnippetEnabled)
      : Number(seoAdvancedNoSnippetEnabled)
        ? 1
        : 0;
  const nextSeoAdvancedNoImageIndexEnabled =
    seoAdvancedNoImageIndexEnabled === undefined
      ? Number(current.seoAdvancedNoImageIndexEnabled)
      : Number(seoAdvancedNoImageIndexEnabled)
        ? 1
        : 0;
  const nextSeoAdvancedMaxSnippet = normalizeDirectiveNumber(
    seoAdvancedMaxSnippet ?? current.seoAdvancedMaxSnippet,
    5000
  );
  const nextSeoAdvancedMaxImagePreview = normalizeAdvancedImagePreview(
    seoAdvancedMaxImagePreview ?? current.seoAdvancedMaxImagePreview
  );
  const nextSeoAdvancedMaxVideoPreview = normalizeDirectiveNumber(
    seoAdvancedMaxVideoPreview ?? current.seoAdvancedMaxVideoPreview,
    86400
  );
  const nextSeoAdvancedUnavailableAfter = normalizeDirectiveText(
    seoAdvancedUnavailableAfter ?? current.seoAdvancedUnavailableAfter,
    80
  );
  const nextSeoAdvancedGooglebotRules = normalizeDirectiveText(
    seoAdvancedGooglebotRules ?? current.seoAdvancedGooglebotRules,
    240
  );
  const nextSeoAdvancedGooglebotNewsRules = normalizeDirectiveText(
    seoAdvancedGooglebotNewsRules ?? current.seoAdvancedGooglebotNewsRules,
    240
  );
  const nextSeoAdvancedHreflangJson = stringifyHreflangEntries(
    seoAdvancedHreflangJson ?? current.seoAdvancedHreflangJson
  );
  const nextSeoSchemaType = normalizeSchemaType(seoSchemaType ?? current.seoSchemaType);
  const nextSeoSchemaName = normalizeText(seoSchemaName ?? current.seoSchemaName, 160);
  const nextSeoSchemaDescription = normalizeText(seoSchemaDescription ?? current.seoSchemaDescription, 320);
  const nextSeoSchemaImageUrl = normalizeUrl(seoSchemaImageUrl ?? current.seoSchemaImageUrl, 1000);
  const nextSeoSchemaUrl = normalizeUrl(seoSchemaUrl ?? current.seoSchemaUrl, 1000);
  const nextSeoSchemaAuthor = normalizeText(seoSchemaAuthor ?? current.seoSchemaAuthor, 120);
  const nextSeoSchemaDatePublished = normalizeDirectiveText(
    seoSchemaDatePublished ?? current.seoSchemaDatePublished,
    64
  );
  const nextSeoSchemaHeadline = normalizeText(seoSchemaHeadline ?? current.seoSchemaHeadline, 160);
  const nextSeoGoogle2026Enabled =
    seoGoogle2026Enabled === undefined
      ? Number(current.seoGoogle2026Enabled ?? GOOGLE_2026_DEFAULTS.moduleEnabled)
      : Number(seoGoogle2026Enabled)
        ? 1
        : 0;
  const nextSeoGoogle2026AgencyName = normalizeGoogle2026Text(
    seoGoogle2026AgencyName ?? current.seoGoogle2026AgencyName ?? GOOGLE_2026_DEFAULTS.agencyName,
    120
  );
  const nextSeoGoogle2026RolloutWindowEnabled =
    seoGoogle2026RolloutWindowEnabled === undefined
      ? Number(current.seoGoogle2026RolloutWindowEnabled ?? GOOGLE_2026_DEFAULTS.rolloutWindowEnabled)
      : Number(seoGoogle2026RolloutWindowEnabled)
        ? 1
        : 0;
  const nextSeoGoogle2026RolloutWindow = normalizeGoogle2026Text(
    seoGoogle2026RolloutWindow ?? current.seoGoogle2026RolloutWindow ?? GOOGLE_2026_DEFAULTS.rolloutWindow,
    800
  );
  const nextSeoGoogle2026TechnicalSeoEnabled =
    seoGoogle2026TechnicalSeoEnabled === undefined
      ? Number(current.seoGoogle2026TechnicalSeoEnabled ?? GOOGLE_2026_DEFAULTS.technicalSeoEnabled)
      : Number(seoGoogle2026TechnicalSeoEnabled)
        ? 1
        : 0;
  const nextSeoGoogle2026TechnicalSeo = normalizeGoogle2026Text(
    seoGoogle2026TechnicalSeo ?? current.seoGoogle2026TechnicalSeo ?? GOOGLE_2026_DEFAULTS.technicalSeo,
    4000
  );
  const nextSeoGoogle2026CoreWebVitalsEnabled =
    seoGoogle2026CoreWebVitalsEnabled === undefined
      ? Number(current.seoGoogle2026CoreWebVitalsEnabled ?? GOOGLE_2026_DEFAULTS.coreWebVitalsEnabled)
      : Number(seoGoogle2026CoreWebVitalsEnabled)
        ? 1
        : 0;
  const nextSeoGoogle2026CoreWebVitals = normalizeGoogle2026Text(
    seoGoogle2026CoreWebVitals ?? current.seoGoogle2026CoreWebVitals ?? GOOGLE_2026_DEFAULTS.coreWebVitals,
    4000
  );
  const nextSeoGoogle2026ContentQualityEnabled =
    seoGoogle2026ContentQualityEnabled === undefined
      ? Number(current.seoGoogle2026ContentQualityEnabled ?? GOOGLE_2026_DEFAULTS.contentQualityEnabled)
      : Number(seoGoogle2026ContentQualityEnabled)
        ? 1
        : 0;
  const nextSeoGoogle2026ContentQuality = normalizeGoogle2026Text(
    seoGoogle2026ContentQuality ?? current.seoGoogle2026ContentQuality ?? GOOGLE_2026_DEFAULTS.contentQuality,
    4000
  );
  const nextSeoGoogle2026SecurityMaintenanceEnabled =
    seoGoogle2026SecurityMaintenanceEnabled === undefined
      ? Number(current.seoGoogle2026SecurityMaintenanceEnabled ?? GOOGLE_2026_DEFAULTS.securityMaintenanceEnabled)
      : Number(seoGoogle2026SecurityMaintenanceEnabled)
        ? 1
        : 0;
  const nextSeoGoogle2026SecurityMaintenance = normalizeGoogle2026Text(
    seoGoogle2026SecurityMaintenance ??
      current.seoGoogle2026SecurityMaintenance ??
      GOOGLE_2026_DEFAULTS.securityMaintenance,
    4000
  );
  const nextSeoGoogle2026LocalAuthorityEnabled =
    seoGoogle2026LocalAuthorityEnabled === undefined
      ? Number(current.seoGoogle2026LocalAuthorityEnabled ?? GOOGLE_2026_DEFAULTS.localAuthorityEnabled)
      : Number(seoGoogle2026LocalAuthorityEnabled)
        ? 1
        : 0;
  const nextSeoGoogle2026LocalAuthority = normalizeGoogle2026Text(
    seoGoogle2026LocalAuthority ?? current.seoGoogle2026LocalAuthority ?? GOOGLE_2026_DEFAULTS.localAuthority,
    4000
  );
  const nextSeoGoogle2026UserExperienceEnabled =
    seoGoogle2026UserExperienceEnabled === undefined
      ? Number(current.seoGoogle2026UserExperienceEnabled ?? GOOGLE_2026_DEFAULTS.userExperienceEnabled)
      : Number(seoGoogle2026UserExperienceEnabled)
        ? 1
        : 0;
  const nextSeoGoogle2026UserExperience = normalizeGoogle2026Text(
    seoGoogle2026UserExperience ?? current.seoGoogle2026UserExperience ?? GOOGLE_2026_DEFAULTS.userExperience,
    4000
  );
  const nextSeoGoogle2026CompetitiveAdvantageEnabled =
    seoGoogle2026CompetitiveAdvantageEnabled === undefined
      ? Number(
          current.seoGoogle2026CompetitiveAdvantageEnabled ?? GOOGLE_2026_DEFAULTS.competitiveAdvantageEnabled
        )
      : Number(seoGoogle2026CompetitiveAdvantageEnabled)
        ? 1
        : 0;
  const nextSeoGoogle2026CompetitiveAdvantage = normalizeGoogle2026Text(
    seoGoogle2026CompetitiveAdvantage ??
      current.seoGoogle2026CompetitiveAdvantage ??
      GOOGLE_2026_DEFAULTS.competitiveAdvantage,
    4000
  );
  const nextSeoImagesModuleEnabled =
    seoImagesModuleEnabled === undefined
      ? Number(current.seoImagesModuleEnabled ?? SEO_IMAGES_DEFAULTS.moduleEnabled)
      : Number(seoImagesModuleEnabled)
        ? 1
        : 0;
  const nextSeoImagesFileNamesEnabled =
    seoImagesFileNamesEnabled === undefined
      ? Number(current.seoImagesFileNamesEnabled ?? SEO_IMAGES_DEFAULTS.fileNamesEnabled)
      : Number(seoImagesFileNamesEnabled)
        ? 1
        : 0;
  const nextSeoImagesFileNames = normalizeSeoImagesText(
    seoImagesFileNames ?? current.seoImagesFileNames ?? SEO_IMAGES_DEFAULTS.fileNames,
    4000
  );
  const nextSeoImagesResizeEnabled =
    seoImagesResizeEnabled === undefined
      ? Number(current.seoImagesResizeEnabled ?? SEO_IMAGES_DEFAULTS.resizeEnabled)
      : Number(seoImagesResizeEnabled)
        ? 1
        : 0;
  const nextSeoImagesResize = normalizeSeoImagesText(
    seoImagesResize ?? current.seoImagesResize ?? SEO_IMAGES_DEFAULTS.resize,
    4000
  );
  const nextSeoImagesCompressionEnabled =
    seoImagesCompressionEnabled === undefined
      ? Number(current.seoImagesCompressionEnabled ?? SEO_IMAGES_DEFAULTS.compressionEnabled)
      : Number(seoImagesCompressionEnabled)
        ? 1
        : 0;
  const nextSeoImagesCompression = normalizeSeoImagesText(
    seoImagesCompression ?? current.seoImagesCompression ?? SEO_IMAGES_DEFAULTS.compression,
    4000
  );
  const nextSeoImagesFormatEnabled =
    seoImagesFormatEnabled === undefined
      ? Number(current.seoImagesFormatEnabled ?? SEO_IMAGES_DEFAULTS.formatEnabled)
      : Number(seoImagesFormatEnabled)
        ? 1
        : 0;
  const nextSeoImagesFormat = normalizeSeoImagesText(
    seoImagesFormat ?? current.seoImagesFormat ?? SEO_IMAGES_DEFAULTS.format,
    4000
  );
  const nextSeoImagesSitemapEnabled =
    seoImagesSitemapEnabled === undefined
      ? Number(current.seoImagesSitemapEnabled ?? SEO_IMAGES_DEFAULTS.sitemapEnabled)
      : Number(seoImagesSitemapEnabled)
        ? 1
        : 0;
  const nextSeoImagesSitemap = normalizeSeoImagesText(
    seoImagesSitemap ?? current.seoImagesSitemap ?? SEO_IMAGES_DEFAULTS.sitemap,
    4000
  );
  const nextSeoImagesCdnEnabled =
    seoImagesCdnEnabled === undefined
      ? Number(current.seoImagesCdnEnabled ?? SEO_IMAGES_DEFAULTS.cdnEnabled)
      : Number(seoImagesCdnEnabled)
        ? 1
        : 0;
  const nextSeoImagesCdn = normalizeSeoImagesText(
    seoImagesCdn ?? current.seoImagesCdn ?? SEO_IMAGES_DEFAULTS.cdn,
    4000
  );
  const nextSeoImagesLazyLoadingEnabled =
    seoImagesLazyLoadingEnabled === undefined
      ? Number(current.seoImagesLazyLoadingEnabled ?? SEO_IMAGES_DEFAULTS.lazyLoadingEnabled)
      : Number(seoImagesLazyLoadingEnabled)
        ? 1
        : 0;
  const nextSeoImagesLazyLoading = normalizeSeoImagesText(
    seoImagesLazyLoading ?? current.seoImagesLazyLoading ?? SEO_IMAGES_DEFAULTS.lazyLoading,
    4000
  );
  const nextSeoImagesBrowserCacheEnabled =
    seoImagesBrowserCacheEnabled === undefined
      ? Number(current.seoImagesBrowserCacheEnabled ?? SEO_IMAGES_DEFAULTS.browserCacheEnabled)
      : Number(seoImagesBrowserCacheEnabled)
        ? 1
        : 0;
  const nextSeoImagesBrowserCache = normalizeSeoImagesText(
    seoImagesBrowserCache ?? current.seoImagesBrowserCache ?? SEO_IMAGES_DEFAULTS.browserCache,
    4000
  );
  const nextSeoImagesStructuredDataEnabled =
    seoImagesStructuredDataEnabled === undefined
      ? Number(current.seoImagesStructuredDataEnabled ?? SEO_IMAGES_DEFAULTS.structuredDataEnabled)
      : Number(seoImagesStructuredDataEnabled)
        ? 1
        : 0;
  const nextSeoImagesStructuredData = normalizeSeoImagesText(
    seoImagesStructuredData ?? current.seoImagesStructuredData ?? SEO_IMAGES_DEFAULTS.structuredData,
    4000
  );
  const nextSeoImagesSocialTagsEnabled =
    seoImagesSocialTagsEnabled === undefined
      ? Number(current.seoImagesSocialTagsEnabled ?? SEO_IMAGES_DEFAULTS.socialTagsEnabled)
      : Number(seoImagesSocialTagsEnabled)
        ? 1
        : 0;
  const nextSeoImagesSocialTags = normalizeSeoImagesText(
    seoImagesSocialTags ?? current.seoImagesSocialTags ?? SEO_IMAGES_DEFAULTS.socialTags,
    4000
  );
  const nextSeoImagesAuditEnabled =
    seoImagesAuditEnabled === undefined
      ? Number(current.seoImagesAuditEnabled ?? SEO_IMAGES_DEFAULTS.auditEnabled)
      : Number(seoImagesAuditEnabled)
        ? 1
        : 0;
  const nextSeoImagesAudit = normalizeSeoImagesText(
    seoImagesAudit ?? current.seoImagesAudit ?? SEO_IMAGES_DEFAULTS.audit,
    4000
  );
  const nextSeoTechFilesEnabled =
    seoTechFilesEnabled === undefined
      ? Number(current.seoTechFilesEnabled ?? SEO_TECH_FILES_DEFAULTS.moduleEnabled)
      : Number(seoTechFilesEnabled)
        ? 1
        : 0;
  const nextSeoSitemapGeneratorEnabled =
    seoSitemapGeneratorEnabled === undefined
      ? Number(current.seoSitemapGeneratorEnabled ?? SEO_TECH_FILES_DEFAULTS.sitemapGeneratorEnabled)
      : Number(seoSitemapGeneratorEnabled)
        ? 1
        : 0;
  const nextSeoSitemapGeneratorNotes = normalizeSeoTechFileText(
    seoSitemapGeneratorNotes ?? current.seoSitemapGeneratorNotes ?? SEO_TECH_FILES_DEFAULTS.sitemapGeneratorNotes,
    4000
  );
  const nextSeoRobotsTxtEnabled =
    seoRobotsTxtEnabled === undefined
      ? Number(current.seoRobotsTxtEnabled ?? SEO_TECH_FILES_DEFAULTS.robotsTxtEnabled)
      : Number(seoRobotsTxtEnabled)
        ? 1
        : 0;
  const nextSeoRobotsTxtContent = normalizeSeoTechFileText(
    seoRobotsTxtContent ?? current.seoRobotsTxtContent ?? SEO_TECH_FILES_DEFAULTS.robotsTxtContent,
    12000
  );
  const nextSeoHtaccessEnabled =
    seoHtaccessEnabled === undefined
      ? Number(current.seoHtaccessEnabled ?? SEO_TECH_FILES_DEFAULTS.htaccessEnabled)
      : Number(seoHtaccessEnabled)
        ? 1
        : 0;
  const nextSeoHtaccessContent = normalizeSeoTechFileText(
    seoHtaccessContent ?? current.seoHtaccessContent ?? SEO_TECH_FILES_DEFAULTS.htaccessContent,
    16000
  );

  const socialWasProvided = seoSocialMetaEnabled !== undefined;
  if (!socialWasProvided && (seoOpenGraphEnabled !== undefined || seoTwitterCardsEnabled !== undefined)) {
    nextSeoSocialMetaEnabled = nextSeoOpenGraphEnabled || nextSeoTwitterCardsEnabled ? 1 : 0;
  }

  if (!nextStoreName || !nextWhatsappNumber) {
    throw new Error('Nombre de tienda y WhatsApp son obligatorios.');
  }

  await run(
    `UPDATE settings
     SET
       store_name = ?,
       store_logo_url = ?,
       store_favicon_url = ?,
       whatsapp_number = ?,
       seo_social_meta_enabled = ?,
       seo_html_meta_enabled = ?,
       seo_open_graph_enabled = ?,
       seo_twitter_cards_enabled = ?,
       seo_advanced_tags_enabled = ?,
       seo_schema_markup_enabled = ?,
       seo_html_default_title = ?,
       seo_html_default_description = ?,
       seo_html_default_keywords = ?,
       seo_html_author = ?,
       seo_html_robots_index_enabled = ?,
       seo_html_robots_follow_enabled = ?,
       seo_html_content_language = ?,
       seo_html_geo_region = ?,
       seo_html_geo_placename = ?,
       seo_html_geo_position = ?,
       seo_og_default_title = ?,
       seo_og_default_description = ?,
       seo_og_images_json = ?,
       seo_og_url = ?,
       seo_og_type = ?,
       seo_og_site_name = ?,
       seo_og_locale = ?,
       seo_twitter_card_type = ?,
       seo_twitter_title = ?,
       seo_twitter_description = ?,
       seo_twitter_image_url = ?,
       seo_twitter_site_handle = ?,
       seo_twitter_creator_handle = ?,
       seo_advanced_canonical_url = ?,
       seo_advanced_noarchive_enabled = ?,
       seo_advanced_nosnippet_enabled = ?,
       seo_advanced_noimageindex_enabled = ?,
       seo_advanced_max_snippet = ?,
       seo_advanced_max_image_preview = ?,
       seo_advanced_max_video_preview = ?,
       seo_advanced_unavailable_after = ?,
       seo_advanced_googlebot_rules = ?,
       seo_advanced_googlebot_news_rules = ?,
       seo_advanced_hreflang_json = ?,
       seo_schema_type = ?,
       seo_schema_name = ?,
       seo_schema_description = ?,
       seo_schema_image_url = ?,
       seo_schema_url = ?,
       seo_schema_author = ?,
       seo_schema_date_published = ?,
       seo_schema_headline = ?,
       seo_google_2026_enabled = ?,
       seo_google_2026_agency_name = ?,
       seo_google_2026_rollout_window_enabled = ?,
       seo_google_2026_rollout_window = ?,
       seo_google_2026_technical_seo_enabled = ?,
       seo_google_2026_technical_seo = ?,
       seo_google_2026_core_web_vitals_enabled = ?,
       seo_google_2026_core_web_vitals = ?,
       seo_google_2026_content_quality_enabled = ?,
       seo_google_2026_content_quality = ?,
       seo_google_2026_security_maintenance_enabled = ?,
       seo_google_2026_security_maintenance = ?,
       seo_google_2026_local_authority_enabled = ?,
       seo_google_2026_local_authority = ?,
       seo_google_2026_user_experience_enabled = ?,
       seo_google_2026_user_experience = ?,
       seo_google_2026_competitive_advantage_enabled = ?,
       seo_google_2026_competitive_advantage = ?,
       seo_images_module_enabled = ?,
       seo_images_file_names_enabled = ?,
       seo_images_file_names = ?,
       seo_images_resize_enabled = ?,
       seo_images_resize = ?,
       seo_images_compression_enabled = ?,
       seo_images_compression = ?,
       seo_images_format_enabled = ?,
       seo_images_format = ?,
       seo_images_sitemap_enabled = ?,
       seo_images_sitemap = ?,
       seo_images_cdn_enabled = ?,
       seo_images_cdn = ?,
       seo_images_lazy_loading_enabled = ?,
       seo_images_lazy_loading = ?,
       seo_images_browser_cache_enabled = ?,
       seo_images_browser_cache = ?,
       seo_images_structured_data_enabled = ?,
       seo_images_structured_data = ?,
       seo_images_social_tags_enabled = ?,
       seo_images_social_tags = ?,
       seo_images_audit_enabled = ?,
       seo_images_audit = ?,
       seo_tech_files_enabled = ?,
       seo_sitemap_generator_enabled = ?,
       seo_sitemap_generator_notes = ?,
       seo_robots_txt_enabled = ?,
       seo_robots_txt_content = ?,
       seo_htaccess_enabled = ?,
       seo_htaccess_content = ?,
       updated_at = datetime('now', 'localtime')
     WHERE id = 1`,
    [
      nextStoreName,
      nextStoreLogoUrl,
      nextStoreFaviconUrl,
      nextWhatsappNumber,
      nextSeoSocialMetaEnabled,
      nextSeoHtmlMetaEnabled,
      nextSeoOpenGraphEnabled,
      nextSeoTwitterCardsEnabled,
      nextSeoAdvancedTagsEnabled,
      nextSeoSchemaMarkupEnabled,
      nextSeoHtmlDefaultTitle,
      nextSeoHtmlDefaultDescription,
      nextSeoHtmlDefaultKeywords,
      nextSeoHtmlAuthor,
      nextSeoHtmlRobotsIndexEnabled,
      nextSeoHtmlRobotsFollowEnabled,
      nextSeoHtmlContentLanguage,
      nextSeoHtmlGeoRegion,
      nextSeoHtmlGeoPlaceName,
      nextSeoHtmlGeoPosition,
      nextSeoOgDefaultTitle,
      nextSeoOgDefaultDescription,
      nextSeoOgImagesJson,
      nextSeoOgUrl,
      nextSeoOgType,
      nextSeoOgSiteName,
      nextSeoOgLocale,
      nextSeoTwitterCardType,
      nextSeoTwitterTitle,
      nextSeoTwitterDescription,
      nextSeoTwitterImageUrl,
      nextSeoTwitterSiteHandle,
      nextSeoTwitterCreatorHandle,
      nextSeoAdvancedCanonicalUrl,
      nextSeoAdvancedNoArchiveEnabled,
      nextSeoAdvancedNoSnippetEnabled,
      nextSeoAdvancedNoImageIndexEnabled,
      nextSeoAdvancedMaxSnippet,
      nextSeoAdvancedMaxImagePreview,
      nextSeoAdvancedMaxVideoPreview,
      nextSeoAdvancedUnavailableAfter,
      nextSeoAdvancedGooglebotRules,
      nextSeoAdvancedGooglebotNewsRules,
      nextSeoAdvancedHreflangJson,
      nextSeoSchemaType,
      nextSeoSchemaName,
      nextSeoSchemaDescription,
      nextSeoSchemaImageUrl,
      nextSeoSchemaUrl,
      nextSeoSchemaAuthor,
      nextSeoSchemaDatePublished,
      nextSeoSchemaHeadline,
      nextSeoGoogle2026Enabled,
      nextSeoGoogle2026AgencyName,
      nextSeoGoogle2026RolloutWindowEnabled,
      nextSeoGoogle2026RolloutWindow,
      nextSeoGoogle2026TechnicalSeoEnabled,
      nextSeoGoogle2026TechnicalSeo,
      nextSeoGoogle2026CoreWebVitalsEnabled,
      nextSeoGoogle2026CoreWebVitals,
      nextSeoGoogle2026ContentQualityEnabled,
      nextSeoGoogle2026ContentQuality,
      nextSeoGoogle2026SecurityMaintenanceEnabled,
      nextSeoGoogle2026SecurityMaintenance,
      nextSeoGoogle2026LocalAuthorityEnabled,
      nextSeoGoogle2026LocalAuthority,
      nextSeoGoogle2026UserExperienceEnabled,
      nextSeoGoogle2026UserExperience,
      nextSeoGoogle2026CompetitiveAdvantageEnabled,
      nextSeoGoogle2026CompetitiveAdvantage,
      nextSeoImagesModuleEnabled,
      nextSeoImagesFileNamesEnabled,
      nextSeoImagesFileNames,
      nextSeoImagesResizeEnabled,
      nextSeoImagesResize,
      nextSeoImagesCompressionEnabled,
      nextSeoImagesCompression,
      nextSeoImagesFormatEnabled,
      nextSeoImagesFormat,
      nextSeoImagesSitemapEnabled,
      nextSeoImagesSitemap,
      nextSeoImagesCdnEnabled,
      nextSeoImagesCdn,
      nextSeoImagesLazyLoadingEnabled,
      nextSeoImagesLazyLoading,
      nextSeoImagesBrowserCacheEnabled,
      nextSeoImagesBrowserCache,
      nextSeoImagesStructuredDataEnabled,
      nextSeoImagesStructuredData,
      nextSeoImagesSocialTagsEnabled,
      nextSeoImagesSocialTags,
      nextSeoImagesAuditEnabled,
      nextSeoImagesAudit,
      nextSeoTechFilesEnabled,
      nextSeoSitemapGeneratorEnabled,
      nextSeoSitemapGeneratorNotes,
      nextSeoRobotsTxtEnabled,
      nextSeoRobotsTxtContent,
      nextSeoHtaccessEnabled,
      nextSeoHtaccessContent
    ]
  );

  await run(
    `UPDATE settings
     SET social_instagram_url = ?,
         social_facebook_url = ?,
         social_youtube_url = ?,
         social_x_url = ?,
         template_social_instagram_url = ?,
         template_social_facebook_url = ?,
         template_social_youtube_url = ?,
         template_social_x_url = ?,
         template_heading_font = ?,
         template_body_font = ?,
         template_heading_color = ?,
         template_body_color = ?,
         template_heading_scale = ?,
         template_heading_size_px = ?,
         template_body_size_px = ?,
         template_google_analytics_id = ?,
         updated_at = datetime('now', 'localtime')
     WHERE id = 1`,
    [
      nextSocialInstagramUrl,
      nextSocialFacebookUrl,
      nextSocialYoutubeUrl,
      nextSocialXUrl,
      nextTemplateSocialInstagramUrl,
      nextTemplateSocialFacebookUrl,
      nextTemplateSocialYoutubeUrl,
      nextTemplateSocialXUrl,
      nextTemplateHeadingFont,
      nextTemplateBodyFont,
      nextTemplateHeadingColor,
      nextTemplateBodyColor,
      nextTemplateHeadingScale,
      nextTemplateHeadingSizePx,
      nextTemplateBodySizePx,
      nextTemplateGoogleAnalyticsId
    ]
  );

  return getSettings();
}

async function listUsers() {
  return all(
    `SELECT
      id,
      username,
      full_name as fullName,
      role,
      is_active as isActive,
      created_at as createdAt
     FROM users
     ORDER BY id ASC`
  );
}

async function createUser({ username, password, fullName, role = 'admin', isActive = 1 }) {
  const normalizedUsername = normalizeText(username, 80).toLowerCase();
  const normalizedPassword = normalizeText(password, 120);
  const normalizedFullName = normalizeText(fullName, 120);
  const normalizedRole = normalizeText(role, 40) || 'admin';
  const normalizedIsActive = Number(isActive) ? 1 : 0;

  if (!normalizedUsername || !normalizedPassword || !normalizedFullName) {
    throw new Error('Datos de usuario incompletos.');
  }

  const passwordHash = await hashPassword(normalizedPassword);
  if (!passwordHash) {
    throw new Error('No se pudo generar hash de contraseña.');
  }

  const result = await run(
    `INSERT INTO users (username, password, full_name, role, is_active)
     VALUES (?, ?, ?, ?, ?)`,
    [normalizedUsername, passwordHash, normalizedFullName, normalizedRole, normalizedIsActive]
  );

  return get(
    `SELECT id, username, full_name as fullName, role, is_active as isActive, created_at as createdAt
     FROM users WHERE id = ?`,
    [result.id]
  );
}

async function updateUser(userId, { username, password, fullName, role, isActive }) {
  const current = await get('SELECT * FROM users WHERE id = ?', [userId]);
  if (!current) return null;

  const nextUsername = normalizeText(username ?? current.username, 80).toLowerCase();
  const incomingPassword = password === undefined ? null : normalizeText(password, 120);
  let nextPassword = String(current.password || '');
  if (incomingPassword !== null) {
    nextPassword = await hashPassword(incomingPassword);
    if (!nextPassword) {
      throw new Error('Contraseña inválida.');
    }
  } else if (!looksLikePasswordHash(nextPassword)) {
    nextPassword = await hashPassword(nextPassword);
    if (!nextPassword) {
      throw new Error('No se pudo migrar contraseña de usuario.');
    }
  }
  const nextFullName = normalizeText(fullName ?? current.full_name, 120);
  const nextRole = normalizeText(role ?? current.role, 40) || 'admin';
  const nextIsActive = isActive === undefined ? Number(current.is_active) : Number(isActive) ? 1 : 0;

  await run(
    `UPDATE users
     SET username = ?, password = ?, full_name = ?, role = ?, is_active = ?
     WHERE id = ?`,
    [nextUsername, nextPassword, nextFullName, nextRole, nextIsActive, userId]
  );

  return get(
    `SELECT id, username, full_name as fullName, role, is_active as isActive, created_at as createdAt
     FROM users WHERE id = ?`,
    [userId]
  );
}

async function deleteUser(userId) {
  const result = await run('DELETE FROM users WHERE id = ?', [userId]);
  return result.changes > 0;
}

async function listCategories() {
  return all(
    `SELECT id, name, slug, icon
     FROM categories
     ORDER BY name ASC`
  );
}

async function createCategory({ name, slug, icon }) {
  const normalizedName = normalizeText(name, 80);
  const normalizedSlug = normalizeText(slug, 80) || slugify(normalizedName);
  const normalizedIcon = normalizeText(icon, 40).toLowerCase() || 'tag';
  if (!normalizedName || !normalizedSlug) {
    throw new Error('Nombre de categoría inválido.');
  }

  const result = await run('INSERT INTO categories (name, slug, icon) VALUES (?, ?, ?)', [
    normalizedName,
    normalizedSlug,
    normalizedIcon
  ]);
  return get('SELECT id, name, slug, icon FROM categories WHERE id = ?', [result.id]);
}

async function updateCategory(categoryId, { name, slug, icon }) {
  const current = await get('SELECT * FROM categories WHERE id = ?', [categoryId]);
  if (!current) return null;
  const nextName = normalizeText(name ?? current.name, 80);
  const nextSlug = normalizeText(slug ?? current.slug, 80) || slugify(nextName);
  const nextIcon = normalizeText(icon ?? current.icon, 40).toLowerCase() || 'tag';
  await run('UPDATE categories SET name = ?, slug = ?, icon = ? WHERE id = ?', [nextName, nextSlug, nextIcon, categoryId]);
  return get('SELECT id, name, slug, icon FROM categories WHERE id = ?', [categoryId]);
}

async function deleteCategory(categoryId) {
  await run('DELETE FROM product_categories WHERE category_id = ?', [categoryId]);
  const result = await run('DELETE FROM categories WHERE id = ?', [categoryId]);
  return result.changes > 0;
}

async function listProductImages() {
  return all(
    `SELECT
      id,
      product_id as productId,
      url,
      alt_text as altText,
      sort_order as sortOrder,
      focal_x as focalX,
      focal_y as focalY
     FROM product_images
     ORDER BY product_id ASC, sort_order ASC, id ASC`
  );
}

async function getProductImageById(imageId) {
  return get(
    `SELECT
      id,
      product_id as productId,
      url,
      alt_text as altText,
      sort_order as sortOrder,
      focal_x as focalX,
      focal_y as focalY
     FROM product_images
     WHERE id = ?`,
    [imageId]
  );
}

async function listProductImagesByProductId(productId) {
  return all(
    `SELECT
      id,
      product_id as productId,
      url,
      alt_text as altText,
      sort_order as sortOrder,
      focal_x as focalX,
      focal_y as focalY
     FROM product_images
     WHERE product_id = ?
     ORDER BY sort_order ASC, id ASC`,
    [productId]
  );
}

async function syncProductMainImage(productId) {
  const normalizedProductId = Number(productId);
  if (!Number.isInteger(normalizedProductId) || normalizedProductId <= 0) return;

  const firstImage = await get(
    `SELECT url
     FROM product_images
     WHERE product_id = ?
     ORDER BY sort_order ASC, id ASC
     LIMIT 1`,
    [normalizedProductId]
  );

  if (firstImage && firstImage.url) {
    await run('UPDATE products SET image_url = ? WHERE id = ?', [firstImage.url, normalizedProductId]);
  }
}

async function setProductMainImage(productId, imageUrl) {
  const normalizedProductId = Number(productId);
  const normalizedImageUrl = normalizeText(imageUrl, 1000);

  if (!Number.isInteger(normalizedProductId) || normalizedProductId <= 0 || !normalizedImageUrl) {
    throw new Error('Imagen principal invalida.');
  }

  const current = await get('SELECT id FROM products WHERE id = ?', [normalizedProductId]);
  if (!current) return null;

  const images = await all(
    `SELECT id, url, sort_order as sortOrder
     FROM product_images
     WHERE product_id = ?
     ORDER BY sort_order ASC, id ASC`,
    [normalizedProductId]
  );

  await run('BEGIN TRANSACTION');
  try {
    const selectedIndex = images.findIndex((img) => img.url === normalizedImageUrl);
    if (selectedIndex >= 0) {
      const ordered = [images[selectedIndex], ...images.filter((_img, index) => index !== selectedIndex)];
      for (let index = 0; index < ordered.length; index += 1) {
        const image = ordered[index];
        if (Number(image.sortOrder) !== index) {
          await run('UPDATE product_images SET sort_order = ? WHERE id = ?', [index, image.id]);
        }
      }
    }

    await run('UPDATE products SET image_url = ? WHERE id = ?', [normalizedImageUrl, normalizedProductId]);
    await run('COMMIT');
  } catch (error) {
    await run('ROLLBACK');
    throw error;
  }

  return get(
    `SELECT id, name, category, price_ars as priceArs, description, image_url as imageUrl
     FROM products WHERE id = ?`,
    [normalizedProductId]
  );
}

async function createProductImage({ productId, url, altText = '', sortOrder = 0, focalX = 50, focalY = 50 }) {
  const normalizedProductId = Number(productId);
  const normalizedUrl = normalizeText(url, 1000);
  const requestedAltText = normalizeText(altText, 160);
  const normalizedSortOrder = Number.isInteger(Number(sortOrder)) ? Number(sortOrder) : 0;
  const normalizedFocalX = normalizeFocalPercent(focalX, 50);
  const normalizedFocalY = normalizeFocalPercent(focalY, 50);

  if (!Number.isInteger(normalizedProductId) || normalizedProductId <= 0 || !normalizedUrl) {
    throw new Error('Imagen de producto inválida.');
  }

  const product = await getProductMetaForAlt(normalizedProductId);
  if (!product) {
    throw new Error('Producto no encontrado para asociar la imagen.');
  }

  const normalizedAltText = shouldAutofillImageAlt(requestedAltText)
    ? buildProductImageAlt(product, normalizedUrl)
    : requestedAltText;

  const result = await run(
    `INSERT INTO product_images (product_id, url, alt_text, sort_order, focal_x, focal_y)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [normalizedProductId, normalizedUrl, normalizedAltText, normalizedSortOrder, normalizedFocalX, normalizedFocalY]
  );

  await syncProductMainImage(normalizedProductId);

  return get(
    `SELECT id, product_id as productId, url, alt_text as altText, sort_order as sortOrder, focal_x as focalX, focal_y as focalY
     FROM product_images WHERE id = ?`,
    [result.id]
  );
}

async function updateProductImage(imageId, { productId, url, altText, sortOrder, focalX, focalY }) {
  const current = await get('SELECT * FROM product_images WHERE id = ?', [imageId]);
  if (!current) return null;

  const previousProductId = Number(current.product_id);
  const nextProductId = productId === undefined ? Number(current.product_id) : Number(productId);
  const nextUrl = normalizeText(url ?? current.url, 1000);
  const requestedAltText = normalizeText(altText ?? current.alt_text, 160);
  const nextSortOrder = sortOrder === undefined ? Number(current.sort_order) : Number(sortOrder);
  const nextFocalX = focalX === undefined ? normalizeFocalPercent(current.focal_x, 50) : normalizeFocalPercent(focalX, 50);
  const nextFocalY = focalY === undefined ? normalizeFocalPercent(current.focal_y, 50) : normalizeFocalPercent(focalY, 50);
  const nextProduct = await getProductMetaForAlt(nextProductId);
  if (!nextProduct) throw new Error('Producto no encontrado para la imagen.');
  const nextAltText = shouldAutofillImageAlt(requestedAltText)
    ? buildProductImageAlt(nextProduct, nextUrl)
    : requestedAltText;

  await run(
    `UPDATE product_images
     SET product_id = ?, url = ?, alt_text = ?, sort_order = ?, focal_x = ?, focal_y = ?
     WHERE id = ?`,
    [nextProductId, nextUrl, nextAltText, nextSortOrder, nextFocalX, nextFocalY, imageId]
  );

  await syncProductMainImage(nextProductId);
  await refreshProductImageAltTexts(nextProductId, nextProduct);
  if (previousProductId !== nextProductId) {
    await syncProductMainImage(previousProductId);
    await refreshProductImageAltTexts(previousProductId);
  }

  return get(
    `SELECT id, product_id as productId, url, alt_text as altText, sort_order as sortOrder, focal_x as focalX, focal_y as focalY
     FROM product_images WHERE id = ?`,
    [imageId]
  );
}

async function deleteProductImage(imageId) {
  const current = await get('SELECT product_id as productId FROM product_images WHERE id = ?', [imageId]);
  const result = await run('DELETE FROM product_images WHERE id = ?', [imageId]);
  if (result.changes > 0 && current && current.productId) {
    await syncProductMainImage(current.productId);
  }
  return result.changes > 0;
}

async function listPageImages() {
  return all(
    `SELECT
      id,
      page_id as pageId,
      url,
      alt_text as altText,
      sort_order as sortOrder,
      focal_x as focalX,
      focal_y as focalY
     FROM page_images
     ORDER BY page_id ASC, sort_order ASC, id ASC`
  );
}

async function getPageImageById(imageId) {
  return get(
    `SELECT
      id,
      page_id as pageId,
      url,
      alt_text as altText,
      sort_order as sortOrder,
      focal_x as focalX,
      focal_y as focalY
     FROM page_images
     WHERE id = ?`,
    [imageId]
  );
}

async function listPageImagesByPageId(pageId) {
  return all(
    `SELECT
      id,
      page_id as pageId,
      url,
      alt_text as altText,
      sort_order as sortOrder,
      focal_x as focalX,
      focal_y as focalY
     FROM page_images
     WHERE page_id = ?
     ORDER BY sort_order ASC, id ASC`,
    [pageId]
  );
}

async function syncPageMainImage(pageId) {
  const normalizedPageId = Number(pageId);
  if (!Number.isInteger(normalizedPageId) || normalizedPageId <= 0) return;

  const firstImage = await get(
    `SELECT url
     FROM page_images
     WHERE page_id = ?
     ORDER BY sort_order ASC, id ASC
     LIMIT 1`,
    [normalizedPageId]
  );

  if (firstImage && firstImage.url) {
    await run('UPDATE pages SET image_url = ? WHERE id = ?', [firstImage.url, normalizedPageId]);
  }
}

async function setPageMainImage(pageId, imageUrl) {
  const normalizedPageId = Number(pageId);
  const normalizedImageUrl = normalizeText(imageUrl, 1000);

  if (!Number.isInteger(normalizedPageId) || normalizedPageId <= 0 || !normalizedImageUrl) {
    throw new Error('Imagen principal invalida.');
  }

  const current = await get('SELECT id FROM pages WHERE id = ?', [normalizedPageId]);
  if (!current) return null;

  const images = await all(
    `SELECT id, url, sort_order as sortOrder
     FROM page_images
     WHERE page_id = ?
     ORDER BY sort_order ASC, id ASC`,
    [normalizedPageId]
  );

  await run('BEGIN TRANSACTION');
  try {
    const selectedIndex = images.findIndex((img) => img.url === normalizedImageUrl);
    if (selectedIndex >= 0) {
      const ordered = [images[selectedIndex], ...images.filter((_img, index) => index !== selectedIndex)];
      for (let index = 0; index < ordered.length; index += 1) {
        const image = ordered[index];
        if (Number(image.sortOrder) !== index) {
          await run('UPDATE page_images SET sort_order = ? WHERE id = ?', [index, image.id]);
        }
      }
    }

    await run('UPDATE pages SET image_url = ? WHERE id = ?', [normalizedImageUrl, normalizedPageId]);
    await run('COMMIT');
  } catch (error) {
    await run('ROLLBACK');
    throw error;
  }

  return get(
    `SELECT id, slug, title, image_url as imageUrl, content_html as contentHtml, updated_at as updatedAt
     FROM pages WHERE id = ?`,
    [normalizedPageId]
  );
}

async function createPageImage({ pageId, url, altText = '', sortOrder = 0, focalX = 50, focalY = 50 }) {
  const normalizedPageId = Number(pageId);
  const normalizedUrl = normalizeText(url, 1000);
  const normalizedAltText = normalizeText(altText, 160);
  const normalizedSortOrder = Number.isInteger(Number(sortOrder)) ? Number(sortOrder) : 0;
  const normalizedFocalX = normalizeFocalPercent(focalX, 50);
  const normalizedFocalY = normalizeFocalPercent(focalY, 50);

  if (!Number.isInteger(normalizedPageId) || normalizedPageId <= 0 || !normalizedUrl) {
    throw new Error('Imagen de pagina invalida.');
  }

  const result = await run(
    `INSERT INTO page_images (page_id, url, alt_text, sort_order, focal_x, focal_y)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [normalizedPageId, normalizedUrl, normalizedAltText, normalizedSortOrder, normalizedFocalX, normalizedFocalY]
  );

  await syncPageMainImage(normalizedPageId);

  return get(
    `SELECT id, page_id as pageId, url, alt_text as altText, sort_order as sortOrder, focal_x as focalX, focal_y as focalY
     FROM page_images WHERE id = ?`,
    [result.id]
  );
}

async function updatePageImage(imageId, { pageId, url, altText, sortOrder, focalX, focalY }) {
  const current = await get('SELECT * FROM page_images WHERE id = ?', [imageId]);
  if (!current) return null;

  const previousPageId = Number(current.page_id);
  const nextPageId = pageId === undefined ? Number(current.page_id) : Number(pageId);
  const nextUrl = normalizeText(url ?? current.url, 1000);
  const nextAltText = normalizeText(altText ?? current.alt_text, 160);
  const nextSortOrder = sortOrder === undefined ? Number(current.sort_order) : Number(sortOrder);
  const nextFocalX = focalX === undefined ? normalizeFocalPercent(current.focal_x, 50) : normalizeFocalPercent(focalX, 50);
  const nextFocalY = focalY === undefined ? normalizeFocalPercent(current.focal_y, 50) : normalizeFocalPercent(focalY, 50);

  await run(
    `UPDATE page_images
     SET page_id = ?, url = ?, alt_text = ?, sort_order = ?, focal_x = ?, focal_y = ?
     WHERE id = ?`,
    [nextPageId, nextUrl, nextAltText, nextSortOrder, nextFocalX, nextFocalY, imageId]
  );

  await syncPageMainImage(nextPageId);
  if (previousPageId !== nextPageId) {
    await syncPageMainImage(previousPageId);
  }

  return get(
    `SELECT id, page_id as pageId, url, alt_text as altText, sort_order as sortOrder, focal_x as focalX, focal_y as focalY
     FROM page_images WHERE id = ?`,
    [imageId]
  );
}

async function deletePageImage(imageId) {
  const current = await get('SELECT page_id as pageId FROM page_images WHERE id = ?', [imageId]);
  const result = await run('DELETE FROM page_images WHERE id = ?', [imageId]);
  if (result.changes > 0 && current && current.pageId) {
    await syncPageMainImage(current.pageId);
  }
  return result.changes > 0;
}

async function listHeroSlides({ activeOnly = false } = {}) {
  const params = [];
  let whereClause = '';
  if (activeOnly) {
    whereClause = 'WHERE is_active = 1';
  }

  return all(
    `SELECT
      id,
      url,
      alt_text as altText,
      title,
      description,
      sort_order as sortOrder,
      focal_x as focalX,
      focal_y as focalY,
      is_active as isActive,
      created_at as createdAt,
      updated_at as updatedAt
     FROM hero_slides
     ${whereClause}
     ORDER BY sort_order ASC, id ASC`,
    params
  );
}

async function getHeroSlideById(slideId) {
  return get(
    `SELECT
      id,
      url,
      alt_text as altText,
      title,
      description,
      sort_order as sortOrder,
      focal_x as focalX,
      focal_y as focalY,
      is_active as isActive,
      created_at as createdAt,
      updated_at as updatedAt
     FROM hero_slides
     WHERE id = ?`,
    [slideId]
  );
}

async function createHeroSlide({
  url,
  altText = '',
  title = '',
  description = '',
  sortOrder = 0,
  focalX = 50,
  focalY = 50,
  isActive = 1
}) {
  const normalizedUrl = normalizeText(url, 1000);
  if (!normalizedUrl) {
    throw new Error('La URL de imagen del slide es obligatoria.');
  }

  const result = await run(
    `INSERT INTO hero_slides (url, alt_text, title, description, sort_order, focal_x, focal_y, is_active, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))`,
    [
      normalizedUrl,
      normalizeText(altText, 180),
      normalizeText(title, 160),
      normalizeText(description, 280),
      Number.isInteger(Number(sortOrder)) ? Number(sortOrder) : 0,
      normalizeFocalPercent(focalX, 50),
      normalizeFocalPercent(focalY, 50),
      Number(isActive) ? 1 : 0
    ]
  );

  return getHeroSlideById(result.id);
}

async function updateHeroSlide(slideId, { url, altText, title, description, sortOrder, focalX, focalY, isActive }) {
  const current = await get('SELECT * FROM hero_slides WHERE id = ?', [slideId]);
  if (!current) return null;

  const nextUrl = normalizeText(url ?? current.url, 1000);
  const nextSortOrder =
    sortOrder === undefined
      ? Number(current.sort_order || 0)
      : Number.isInteger(Number(sortOrder))
        ? Number(sortOrder)
        : Number(current.sort_order || 0);
  if (!nextUrl) {
    throw new Error('La URL de imagen del slide es obligatoria.');
  }

  await run(
    `UPDATE hero_slides
     SET
       url = ?,
       alt_text = ?,
       title = ?,
       description = ?,
       sort_order = ?,
       focal_x = ?,
       focal_y = ?,
       is_active = ?,
       updated_at = datetime('now', 'localtime')
     WHERE id = ?`,
    [
      nextUrl,
      normalizeText(altText ?? current.alt_text, 180),
      normalizeText(title ?? current.title, 160),
      normalizeText(description ?? current.description, 280),
      nextSortOrder,
      focalX === undefined ? normalizeFocalPercent(current.focal_x, 50) : normalizeFocalPercent(focalX, 50),
      focalY === undefined ? normalizeFocalPercent(current.focal_y, 50) : normalizeFocalPercent(focalY, 50),
      isActive === undefined ? (Number(current.is_active) ? 1 : 0) : Number(isActive) ? 1 : 0,
      slideId
    ]
  );

  return getHeroSlideById(slideId);
}

async function deleteHeroSlide(slideId) {
  const result = await run('DELETE FROM hero_slides WHERE id = ?', [slideId]);
  return result.changes > 0;
}

async function listPages() {
  return all(
    `SELECT id, slug, title, image_url as imageUrl, content_html as contentHtml, updated_at as updatedAt
     FROM pages
     ORDER BY slug ASC`
  );
}

async function createPage({ slug, title, contentHtml, imageUrl = '' }) {
  const normalizedSlug = normalizeText(slug, 80).toLowerCase();
  const normalizedTitle = normalizeText(title, 160);
  const normalizedImageUrl = normalizeText(imageUrl, 1000);
  const normalizedContent = String(contentHtml || '').trim();
  if (!normalizedSlug || !normalizedTitle || !normalizedContent) {
    throw new Error('Datos de página inválidos.');
  }

  const result = await run(
    `INSERT INTO pages (slug, title, image_url, content_html)
     VALUES (?, ?, ?, ?)`,
    [normalizedSlug, normalizedTitle, normalizedImageUrl, normalizedContent]
  );
  return get(
    `SELECT id, slug, title, image_url as imageUrl, content_html as contentHtml, updated_at as updatedAt
     FROM pages WHERE id = ?`,
    [result.id]
  );
}

async function updatePage(pageId, { slug, title, contentHtml, imageUrl }) {
  const current = await get('SELECT * FROM pages WHERE id = ?', [pageId]);
  if (!current) return null;

  const nextSlug = normalizeText(slug ?? current.slug, 80).toLowerCase();
  const nextTitle = normalizeText(title ?? current.title, 160);
  const nextImageUrl = normalizeText(imageUrl ?? current.image_url, 1000);
  const nextContent = String(contentHtml ?? current.content_html).trim();

  await run(
    `UPDATE pages
     SET slug = ?, title = ?, image_url = ?, content_html = ?, updated_at = datetime('now', 'localtime')
     WHERE id = ?`,
    [nextSlug, nextTitle, nextImageUrl, nextContent, pageId]
  );

  return get(
    `SELECT id, slug, title, image_url as imageUrl, content_html as contentHtml, updated_at as updatedAt
     FROM pages WHERE id = ?`,
    [pageId]
  );
}

async function deletePage(pageId) {
  await run('DELETE FROM page_images WHERE page_id = ?', [pageId]);
  const result = await run('DELETE FROM pages WHERE id = ?', [pageId]);
  return result.changes > 0;
}

async function listProductsAdmin() {
  return all(
    `SELECT
      id,
      name,
      category,
      price_ars as priceArs,
      description,
      image_url as imageUrl,
      on_sale as onSale
     FROM products
     ORDER BY id ASC`
  );
}

async function createProductAdmin({ name, category, priceArs, description, imageUrl, onSale }) {
  const normalizedName = normalizeText(name, 120);
  const normalizedCategory = normalizeText(category, 80);
  const normalizedPrice = Number(priceArs);
  const normalizedDescription = normalizeText(description, 500);
  const normalizedImageUrl = normalizeText(imageUrl, 1000);
  const normalizedOnSale = Number(onSale) ? 1 : 0;
  if (!normalizedName || !normalizedCategory || !Number.isFinite(normalizedPrice) || normalizedPrice <= 0 || !normalizedImageUrl) {
    throw new Error('Datos de producto inválidos.');
  }

  const fallback = fallbackByCategory(normalizedCategory, normalizedDescription);
  const result = await run(
    `INSERT INTO products (name, category, price_ars, description, image_url, colors, sizes, stock_qty, detail_text, on_sale)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      normalizedName,
      normalizedCategory,
      Math.round(normalizedPrice),
      normalizedDescription,
      normalizedImageUrl,
      fallback.colors,
      fallback.sizes,
      fallback.stockQty,
      fallback.detailText,
      normalizedOnSale
    ]
  );

  await ensureCategoriesAndImagesFromProducts();
  await refreshProductImageAltTexts(result.id, {
    id: result.id,
    name: normalizedName,
    category: normalizedCategory,
    description: normalizedDescription
  });
  return setProductMainImage(result.id, normalizedImageUrl);
}

async function updateProductAdmin(productId, { name, category, priceArs, description, imageUrl, onSale }) {
  const current = await get('SELECT * FROM products WHERE id = ?', [productId]);
  if (!current) return null;

  const nextName = normalizeText(name ?? current.name, 120);
  const nextCategory = normalizeText(category ?? current.category, 80);
  const nextPrice = priceArs === undefined ? Number(current.price_ars) : Number(priceArs);
  const nextDescription = normalizeText(description ?? current.description, 500);
  const nextImageUrl = normalizeText(imageUrl ?? current.image_url, 1000);
  const nextOnSale = onSale === undefined ? Number(current.on_sale || 0) : Number(onSale) ? 1 : 0;

  if (!nextName || !nextCategory || !Number.isFinite(nextPrice) || nextPrice <= 0 || !nextImageUrl) {
    throw new Error('Datos de producto inválidos.');
  }

  await run(
    `UPDATE products
     SET name = ?, category = ?, price_ars = ?, description = ?, image_url = ?, on_sale = ?
     WHERE id = ?`,
    [nextName, nextCategory, Math.round(nextPrice), nextDescription, nextImageUrl, nextOnSale, productId]
  );

  await ensureCategoriesAndImagesFromProducts();
  await refreshProductImageAltTexts(productId, {
    id: productId,
    name: nextName,
    category: nextCategory,
    description: nextDescription
  });
  return setProductMainImage(productId, nextImageUrl);
}

async function deleteProductAdmin(productId) {
  await run('DELETE FROM product_images WHERE product_id = ?', [productId]);
  await run('DELETE FROM product_categories WHERE product_id = ?', [productId]);
  const result = await run('DELETE FROM products WHERE id = ?', [productId]);
  return result.changes > 0;
}

async function getFooterSettings() {
  let row = await get(
    `SELECT
      id,
      brand_title as brandTitle,
      brand_description as brandDescription,
      contact_title as contactTitle,
      contact_whatsapp_text as contactWhatsappText,
      contact_email_text as contactEmailText,
      contact_hours_text as contactHoursText,
      location_title as locationTitle,
      location_line1_text as locationLine1Text,
      location_line2_text as locationLine2Text,
      social_title as socialTitle,
      updated_at as updatedAt
     FROM footer_settings
     WHERE id = 1`
  );

  if (!row) {
    await seedFooterSettings();
    row = await get(
      `SELECT
        id,
        brand_title as brandTitle,
        brand_description as brandDescription,
        contact_title as contactTitle,
        contact_whatsapp_text as contactWhatsappText,
        contact_email_text as contactEmailText,
        contact_hours_text as contactHoursText,
        location_title as locationTitle,
        location_line1_text as locationLine1Text,
        location_line2_text as locationLine2Text,
        social_title as socialTitle,
        updated_at as updatedAt
       FROM footer_settings
       WHERE id = 1`
    );
  }

  const settings = await getSettings();
  const storeNameFallback = normalizeText(settings?.storeName || DEFAULT_STORE_NAME, 120);
  const whatsappFallbackRaw = normalizeText(settings?.whatsappNumber || DEFAULT_WHATSAPP_NUMBER, 40);
  const whatsappFallback = whatsappFallbackRaw ? `WhatsApp: ${whatsappFallbackRaw}` : '';

  return {
    id: 1,
    brandTitle: normalizeText(row?.brandTitle || storeNameFallback, 120),
    brandDescription: normalizeText(
      row?.brandDescription || 'Tienda deportiva online. Atencion personalizada para pedidos por WhatsApp en toda Argentina.',
      300
    ),
    contactTitle: normalizeText(row?.contactTitle || 'Contacto', 80),
    contactWhatsappText: normalizeText(row?.contactWhatsappText || whatsappFallback, 120),
    contactEmailText: normalizeText(row?.contactEmailText || `Email: ${DEFAULT_FOOTER_CONTACT_EMAIL}`, 120),
    contactHoursText: normalizeText(row?.contactHoursText || DEFAULT_FOOTER_CONTACT_HOURS, 120),
    locationTitle: normalizeText(row?.locationTitle || 'Ubicacion', 80),
    locationLine1Text: normalizeText(row?.locationLine1Text || DEFAULT_FOOTER_LOCATION_LINE1, 120),
    locationLine2Text: normalizeText(row?.locationLine2Text || DEFAULT_FOOTER_LOCATION_LINE2, 120),
    socialTitle: normalizeText(row?.socialTitle || 'Redes', 80),
    updatedAt: row?.updatedAt || null
  };
}

async function listFooterSettings() {
  const row = await getFooterSettings();
  return row ? [row] : [];
}

async function updateFooterSettings(input = {}) {
  const current = await getFooterSettings();
  const next = {
    brandTitle: normalizeText(input.brandTitle ?? current.brandTitle, 120),
    brandDescription: normalizeText(input.brandDescription ?? current.brandDescription, 300),
    contactTitle: normalizeText(input.contactTitle ?? current.contactTitle, 80),
    contactWhatsappText: normalizeText(input.contactWhatsappText ?? current.contactWhatsappText, 120),
    contactEmailText: normalizeText(input.contactEmailText ?? current.contactEmailText, 120),
    contactHoursText: normalizeText(input.contactHoursText ?? current.contactHoursText, 120),
    locationTitle: normalizeText(input.locationTitle ?? current.locationTitle, 80),
    locationLine1Text: normalizeText(input.locationLine1Text ?? current.locationLine1Text, 120),
    locationLine2Text: normalizeText(input.locationLine2Text ?? current.locationLine2Text, 120),
    socialTitle: normalizeText(input.socialTitle ?? current.socialTitle, 80)
  };

  await run(
    `INSERT INTO footer_settings (
      id,
      brand_title,
      brand_description,
      contact_title,
      contact_whatsapp_text,
      contact_email_text,
      contact_hours_text,
      location_title,
      location_line1_text,
      location_line2_text,
      social_title,
      updated_at
    ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
    ON CONFLICT(id) DO UPDATE SET
      brand_title = excluded.brand_title,
      brand_description = excluded.brand_description,
      contact_title = excluded.contact_title,
      contact_whatsapp_text = excluded.contact_whatsapp_text,
      contact_email_text = excluded.contact_email_text,
      contact_hours_text = excluded.contact_hours_text,
      location_title = excluded.location_title,
      location_line1_text = excluded.location_line1_text,
      location_line2_text = excluded.location_line2_text,
      social_title = excluded.social_title,
      updated_at = datetime('now', 'localtime')`,
    [
      next.brandTitle,
      next.brandDescription,
      next.contactTitle,
      next.contactWhatsappText,
      next.contactEmailText,
      next.contactHoursText,
      next.locationTitle,
      next.locationLine1Text,
      next.locationLine2Text,
      next.socialTitle
    ]
  );

  return getFooterSettings();
}

function parseSecurityPatterns(rawValue) {
  return String(rawValue || '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 50);
}

async function getSecuritySettings() {
  const row = await get(
    `SELECT
      security_enabled as enabled,
      security_headers_enabled as headersEnabled,
      security_rate_limit_enabled as rateLimitEnabled,
      security_rate_limit_window_sec as rateLimitWindowSec,
      security_rate_limit_max as rateLimitMax,
      security_order_rate_limit_max as orderRateLimitMax,
      security_block_bad_ua_enabled as blockBadUaEnabled,
      security_blocked_ua_patterns as blockedUaPatterns,
      security_honeypot_enabled as honeypotEnabled,
      security_honeypot_field as honeypotField
     FROM settings
     WHERE id = 1`
  );

  if (!row) {
    return {
      enabled: 1,
      headersEnabled: 1,
      rateLimitEnabled: 1,
      rateLimitWindowSec: 60,
      rateLimitMax: 120,
      orderRateLimitMax: 20,
      blockBadUaEnabled: 1,
      blockedUaPatterns: 'bot,crawler,scrapy,python-requests,curl,wget,httpclient',
      honeypotEnabled: 1,
      honeypotField: 'website'
    };
  }

  return {
    enabled: Number(row.enabled ?? 1) ? 1 : 0,
    headersEnabled: Number(row.headersEnabled ?? 1) ? 1 : 0,
    rateLimitEnabled: Number(row.rateLimitEnabled ?? 1) ? 1 : 0,
    rateLimitWindowSec: Math.max(10, Math.min(3600, Number(row.rateLimitWindowSec || 60))),
    rateLimitMax: Math.max(10, Math.min(5000, Number(row.rateLimitMax || 120))),
    orderRateLimitMax: Math.max(1, Math.min(1000, Number(row.orderRateLimitMax || 20))),
    blockBadUaEnabled: Number(row.blockBadUaEnabled ?? 1) ? 1 : 0,
    blockedUaPatterns: parseSecurityPatterns(row.blockedUaPatterns).join(','),
    honeypotEnabled: Number(row.honeypotEnabled ?? 1) ? 1 : 0,
    honeypotField: normalizeText(row.honeypotField || 'website', 60).toLowerCase() || 'website'
  };
}

async function updateSecuritySettings(input = {}) {
  const current = await getSecuritySettings();

  const next = {
    enabled: input.enabled === undefined ? current.enabled : Number(input.enabled) ? 1 : 0,
    headersEnabled: input.headersEnabled === undefined ? current.headersEnabled : Number(input.headersEnabled) ? 1 : 0,
    rateLimitEnabled: input.rateLimitEnabled === undefined ? current.rateLimitEnabled : Number(input.rateLimitEnabled) ? 1 : 0,
    rateLimitWindowSec:
      input.rateLimitWindowSec === undefined
        ? current.rateLimitWindowSec
        : Math.max(10, Math.min(3600, Number(input.rateLimitWindowSec || 60))),
    rateLimitMax:
      input.rateLimitMax === undefined
        ? current.rateLimitMax
        : Math.max(10, Math.min(5000, Number(input.rateLimitMax || 120))),
    orderRateLimitMax:
      input.orderRateLimitMax === undefined
        ? current.orderRateLimitMax
        : Math.max(1, Math.min(1000, Number(input.orderRateLimitMax || 20))),
    blockBadUaEnabled:
      input.blockBadUaEnabled === undefined ? current.blockBadUaEnabled : Number(input.blockBadUaEnabled) ? 1 : 0,
    blockedUaPatterns:
      input.blockedUaPatterns === undefined
        ? current.blockedUaPatterns
        : parseSecurityPatterns(input.blockedUaPatterns).join(','),
    honeypotEnabled: input.honeypotEnabled === undefined ? current.honeypotEnabled : Number(input.honeypotEnabled) ? 1 : 0,
    honeypotField:
      input.honeypotField === undefined
        ? current.honeypotField
        : normalizeText(input.honeypotField, 60).toLowerCase() || 'website'
  };

  await run(
    `UPDATE settings
     SET
       security_enabled = ?,
       security_headers_enabled = ?,
       security_rate_limit_enabled = ?,
       security_rate_limit_window_sec = ?,
       security_rate_limit_max = ?,
       security_order_rate_limit_max = ?,
       security_block_bad_ua_enabled = ?,
       security_blocked_ua_patterns = ?,
       security_honeypot_enabled = ?,
       security_honeypot_field = ?,
       updated_at = datetime('now', 'localtime')
     WHERE id = 1`,
    [
      next.enabled,
      next.headersEnabled,
      next.rateLimitEnabled,
      next.rateLimitWindowSec,
      next.rateLimitMax,
      next.orderRateLimitMax,
      next.blockBadUaEnabled,
      next.blockedUaPatterns,
      next.honeypotEnabled,
      next.honeypotField
    ]
  );

  return getSecuritySettings();
}

module.exports = {
  initDb,
  getProducts,
  getProductById,
  getDashboardSummary,
  createOrder,
  listOrdersAdmin,
  getOrderAdminById,
  createOrderAdmin,
  updateOrderAdmin,
  deleteOrderAdmin,
  getPageBySlug,
  getSettings,
  listSettings,
  updateSettings,
  authenticateUser,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listProductImages,
  getProductImageById,
  listProductImagesByProductId,
  createProductImage,
  updateProductImage,
  deleteProductImage,
  setProductMainImage,
  listPageImages,
  getPageImageById,
  listPageImagesByPageId,
  createPageImage,
  updatePageImage,
  deletePageImage,
  listHeroSlides,
  getHeroSlideById,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  setPageMainImage,
  listPages,
  createPage,
  updatePage,
  deletePage,
  listProductsAdmin,
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  getFooterSettings,
  listFooterSettings,
  updateFooterSettings,
  regenerateAllProductImageAltTexts,
  getSecuritySettings,
  updateSecuritySettings
};
