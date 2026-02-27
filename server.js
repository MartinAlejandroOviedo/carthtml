const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const multer = require('multer');
const sharp = require('sharp');
const { buildSeoMetaTags, buildProductSocialMetaTags, injectSocialMetaIntoHtml } = require('./mod/social-meta');
const {
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
  setPageMainImage,
  listPages,
  createPage,
  updatePage,
  deletePage,
  listProductsAdmin,
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  regenerateAllProductImageAltTexts,
  getSecuritySettings,
  updateSecuritySettings
} = require('./src/db');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '5491112345678';
const PANEL_SESSION_COOKIE = 'panel_session';
const PANEL_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const uploadDir = path.join(__dirname, 'public', 'uploads');
const typedImagesDir = path.join(uploadDir, 'images');
const IMAGE_VARIANTS = {
  slider: { width: 500, height: 300 },
  card: { width: 360, height: 190 }
};

fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
fs.mkdirSync(typedImagesDir, { recursive: true, mode: 0o755 });

let cachedSecuritySettings = null;
let cachedSecuritySettingsAt = 0;
const SECURITY_SETTINGS_CACHE_MS = 5000;
const rateLimitBuckets = new Map();
const panelSessions = new Map();

function parseProductId(raw) {
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) return null;
  return value;
}

function getRequestBaseUrl(req) {
  const forwardedProto = String(req.get('x-forwarded-proto') || '')
    .split(',')[0]
    .trim();
  const protocol = forwardedProto || req.protocol || 'http';
  return `${protocol}://${req.get('host')}`;
}

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function applyTextTemplate(value, vars = {}) {
  return String(value || '')
    .replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (_all, key) => {
      const k = String(key || '').toLowerCase();
      return vars[k] === undefined || vars[k] === null ? '' : String(vars[k]);
    })
    .trim();
}

function parseClientIp(req) {
  const forwarded = String(req.get('x-forwarded-for') || '')
    .split(',')[0]
    .trim();
  return forwarded || req.ip || req.socket?.remoteAddress || 'unknown';
}

function parseCookies(headerValue) {
  const source = String(headerValue || '');
  if (!source) return {};
  return source.split(';').reduce((acc, entry) => {
    const [rawKey, ...rawValueParts] = entry.split('=');
    const key = String(rawKey || '').trim();
    if (!key) return acc;
    const value = rawValueParts.join('=').trim();
    try {
      acc[key] = decodeURIComponent(value || '');
    } catch (_error) {
      acc[key] = value || '';
    }
    return acc;
  }, {});
}

function getPanelSessionToken(req) {
  const cookies = parseCookies(req.headers?.cookie || '');
  return String(cookies[PANEL_SESSION_COOKIE] || '').trim();
}

function createPanelSession(user) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + PANEL_SESSION_TTL_MS;
  panelSessions.set(token, {
    userId: Number(user?.id || 0),
    username: String(user?.username || '').trim(),
    role: String(user?.role || 'admin').trim() || 'admin',
    expiresAt
  });
  return { token, expiresAt };
}

function cleanupExpiredPanelSessions() {
  const now = Date.now();
  for (const [token, session] of panelSessions.entries()) {
    if (!session || Number(session.expiresAt || 0) <= now) {
      panelSessions.delete(token);
    }
  }
}

function setPanelSessionCookie(res, token, expiresAt) {
  const isSecure = process.env.NODE_ENV === 'production';
  res.cookie(PANEL_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecure,
    path: '/',
    expires: new Date(expiresAt)
  });
}

function clearPanelSessionCookie(res) {
  const isSecure = process.env.NODE_ENV === 'production';
  res.clearCookie(PANEL_SESSION_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecure,
    path: '/'
  });
}

function getPanelSession(req) {
  const token = getPanelSessionToken(req);
  if (!token) return null;
  const session = panelSessions.get(token);
  if (!session) return null;
  if (Number(session.expiresAt || 0) <= Date.now()) {
    panelSessions.delete(token);
    return null;
  }
  return { token, ...session };
}

function requirePanelAuth(req, res, next) {
  const security = req.runtimeSecurity || {
    rateLimitWindowSec: 60,
    rateLimitMax: 120
  };

  const decision = checkRateLimit({
    scope: 'panel-api',
    req,
    maxRequests: security.rateLimitMax,
    windowSec: security.rateLimitWindowSec
  });
  if (!decision.allowed) {
    return res.status(429).json({ error: 'Demasiadas solicitudes al panel. Intenta nuevamente en unos segundos.' });
  }

  const session = getPanelSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Sesion requerida.' });
  }
  req.panelSession = session;
  return next();
}

async function loadSecuritySettings(force = false) {
  const now = Date.now();
  if (!force && cachedSecuritySettings && now - cachedSecuritySettingsAt < SECURITY_SETTINGS_CACHE_MS) {
    return cachedSecuritySettings;
  }
  const settings = await getSecuritySettings().catch(() => null);
  cachedSecuritySettings = settings || {
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
  cachedSecuritySettingsAt = now;
  return cachedSecuritySettings;
}

function getRateBucketState(key, windowMs) {
  const now = Date.now();
  const current = rateLimitBuckets.get(key);
  if (!current || now - current.startedAt >= windowMs) {
    const next = { startedAt: now, count: 0 };
    rateLimitBuckets.set(key, next);
    return next;
  }
  return current;
}

function checkRateLimit({ scope, req, maxRequests, windowSec }) {
  const safeMax = Math.max(1, Number(maxRequests || 1));
  const safeWindowSec = Math.max(1, Number(windowSec || 60));
  const windowMs = safeWindowSec * 1000;
  const ip = parseClientIp(req);
  const key = `${scope}:${ip}`;
  const bucket = getRateBucketState(key, windowMs);
  bucket.count += 1;
  const remaining = Math.max(0, safeMax - bucket.count);
  const resetMs = Math.max(0, windowMs - (Date.now() - bucket.startedAt));
  return {
    allowed: bucket.count <= safeMax,
    remaining,
    resetMs
  };
}

function applySecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
}

function isBlockedUserAgent(uaRaw, blockedPatternsRaw) {
  const ua = String(uaRaw || '').toLowerCase();
  if (!ua) return false;
  const patterns = String(blockedPatternsRaw || '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  if (!patterns.length) return false;
  return patterns.some((pattern) => ua.includes(pattern));
}

function buildSitemapXml({ baseUrl, products = [] }) {
  const now = new Date().toISOString();
  const entries = [];

  const staticPaths = ['/', '/help.html', '/security.html', '/cart.html'];
  staticPaths.forEach((p) => {
    entries.push({
      loc: `${baseUrl}${p === '/' ? '' : p}`,
      lastmod: now,
      changefreq: p === '/' ? 'daily' : 'weekly',
      priority: p === '/' ? '1.0' : '0.7',
      image: ''
    });
  });

  products.forEach((product) => {
    if (!product || !Number.isInteger(Number(product.id))) return;
    const loc = `${baseUrl}/product.html?id=${product.id}`;
    const image =
      product?.images?.[0]?.sliderUrl ||
      product?.imageSliderUrl ||
      product?.imageUrl ||
      '';
    entries.push({
      loc,
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.8',
      image
    });
  });

  const body = entries
    .map((entry) => {
      const imageTag = entry.image
        ? `
    <image:image>
      <image:loc>${escapeXml(entry.image.startsWith('http') ? entry.image : `${baseUrl}${entry.image}`)}</image:loc>
    </image:image>`
        : '';
      return `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${escapeXml(entry.lastmod)}</lastmod>
    <changefreq>${escapeXml(entry.changefreq)}</changefreq>
    <priority>${escapeXml(entry.priority)}</priority>${imageTag}
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${body}
</urlset>`;
}

function normalizeEntityType(raw) {
  const type = String(raw || '')
    .trim()
    .toLowerCase();
  if (!type) return null;
  if (!/^[a-z0-9][a-z0-9_-]{1,39}$/.test(type)) return null;
  return type;
}

function normalizeEntityId(raw) {
  const asNumber = parseProductId(raw);
  if (asNumber) return String(asNumber);

  const id = String(raw || '')
    .trim()
    .toLowerCase();
  if (!id) return null;
  if (!/^[a-z0-9][a-z0-9_-]{0,79}$/.test(id)) return null;
  return id;
}

function parseUploadContext(req) {
  const entityType = normalizeEntityType(req.body?.entityType || req.query?.entityType);
  const entityId = normalizeEntityId(req.body?.entityId || req.body?.entityKey || req.query?.entityId || req.query?.entityKey);
  if (entityType && entityId) {
    return { entityType, entityId };
  }

  const productId = parseProductId(req.body?.productId) || parseProductId(req.query?.productId);
  if (productId) {
    return { entityType: 'product', entityId: String(productId) };
  }

  return null;
}

function safeExtension(fileName) {
  const ext = path.extname(fileName || '').toLowerCase() || '.jpg';
  return ext.match(/^\.[a-z0-9]+$/) ? ext : '.jpg';
}

function safeBaseName(fileName) {
  const base = path.basename(fileName || '', path.extname(fileName || ''));
  const normalized = String(base || 'img').toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/^-+|-+$/g, '');
  return normalized || 'img';
}

function uniqueFileName(targetDir, originalName) {
  const ext = safeExtension(originalName);
  const base = safeBaseName(originalName);
  let candidate = `${base}${ext}`;
  let counter = 1;
  while (fs.existsSync(path.join(targetDir, candidate))) {
    candidate = `${base}-${counter}${ext}`;
    counter += 1;
  }
  return candidate;
}

const ALLOWED_UPLOAD_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

function detectImageTypeFromMagic(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return '';

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'image/webp';
  }
  if (
    buffer[4] === 0x66 &&
    buffer[5] === 0x74 &&
    buffer[6] === 0x79 &&
    buffer[7] === 0x70 &&
    buffer[8] === 0x61 &&
    buffer[9] === 0x76 &&
    buffer[10] === 0x69 &&
    buffer[11] === 0x66
  ) {
    return 'image/avif';
  }

  return '';
}

async function validateUploadedFileType(file) {
  const mimeType = String(file?.mimetype || '').toLowerCase();
  if (!ALLOWED_UPLOAD_MIME_TYPES.has(mimeType)) {
    return { ok: false, reason: 'Tipo de imagen no permitido. Solo JPG, PNG, WEBP o AVIF.' };
  }
  try {
    const fd = await fs.promises.open(file.path, 'r');
    const buffer = Buffer.alloc(16);
    await fd.read(buffer, 0, 16, 0);
    await fd.close();
    const detected = detectImageTypeFromMagic(buffer);
    if (!detected) {
      return { ok: false, reason: 'No se pudo verificar el formato real de la imagen.' };
    }
    if (!ALLOWED_UPLOAD_MIME_TYPES.has(detected)) {
      return { ok: false, reason: 'Formato de imagen bloqueado por politica de seguridad.' };
    }
    if (detected !== mimeType) {
      return { ok: false, reason: 'El tipo de archivo no coincide con su contenido real.' };
    }
    return { ok: true };
  } catch (_error) {
    return { ok: false, reason: 'No se pudo validar la imagen subida.' };
  }
}

function publicUrlForUpload(uploadContext, fileName) {
  if (uploadContext && uploadContext.entityType && uploadContext.entityId) {
    return `/uploads/images/${uploadContext.entityType}/${uploadContext.entityId}/${fileName}`;
  }
  return `/uploads/${fileName}`;
}

function variantFileName(originalFileName, variant) {
  const base = path.basename(String(originalFileName || ''), path.extname(String(originalFileName || ''))) || 'img';
  return `${base}-${variant}.webp`;
}

async function getDirSizeBytes(dirPath) {
  let total = 0;
  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        total += await getDirSizeBytes(full);
      } else if (entry.isFile()) {
        const stat = await fs.promises.stat(full);
        total += Number(stat.size || 0);
      }
    }
  } catch (_error) {
    return total;
  }
  return total;
}

async function generateImageVariants(file, uploadContext) {
  if (!file || !file.path || !file.filename) {
    throw new Error('Archivo inválido para generar variantes.');
  }

  const targetDir = path.dirname(file.path);
  const sliderName = variantFileName(file.filename, 'slider');
  const cardName = variantFileName(file.filename, 'card');
  const sliderPath = path.join(targetDir, sliderName);
  const cardPath = path.join(targetDir, cardName);

  await sharp(file.path)
    .rotate()
    .resize(IMAGE_VARIANTS.slider.width, IMAGE_VARIANTS.slider.height, { fit: 'cover', position: 'center' })
    .webp({ quality: 84 })
    .toFile(sliderPath);

  await sharp(file.path)
    .rotate()
    .resize(IMAGE_VARIANTS.card.width, IMAGE_VARIANTS.card.height, { fit: 'cover', position: 'center' })
    .webp({ quality: 84 })
    .toFile(cardPath);

  return {
    sliderUrl: publicUrlForUpload(uploadContext, sliderName),
    cardUrl: publicUrlForUpload(uploadContext, cardName)
  };
}

function resolveUploadFilePath(fileUrl) {
  const raw = String(fileUrl || '');
  if (!raw.startsWith('/uploads/')) return null;

  const relative = raw.replace(/^\/uploads\//, '');
  const safeRelative = path.normalize(relative).replace(/^(\.\.(\/|\\|$))+/, '');
  const full = path.join(uploadDir, safeRelative);
  const uploadRoot = path.resolve(uploadDir) + path.sep;
  const resolved = path.resolve(full);
  if (!resolved.startsWith(uploadRoot)) return null;
  return resolved;
}

async function deleteUploadedFileByUrl(fileUrl) {
  const target = resolveUploadFilePath(fileUrl);
  if (!target) return;
  try {
    await fs.promises.unlink(target);
  } catch (error) {
    if (error && error.code !== 'ENOENT') {
      console.warn('No se pudo borrar archivo:', target, error.message);
    }
  }
}

function buildImageFamilyUrls(fileUrl) {
  const raw = String(fileUrl || '');
  if (!raw.startsWith('/uploads/')) return [];

  const parsed = path.posix.parse(raw);
  if (!parsed.dir || !parsed.name) return [raw];

  // If the saved URL is already a variant (`-slider`/`-card`), recover the base image name.
  const baseName = parsed.name.replace(/-(slider|card)$/i, '');
  const originalUrl = `${parsed.dir}/${baseName}${parsed.ext}`;
  const sliderUrl = `${parsed.dir}/${baseName}-slider.webp`;
  const cardUrl = `${parsed.dir}/${baseName}-card.webp`;

  return [...new Set([raw, originalUrl, sliderUrl, cardUrl])];
}

async function deleteUploadedImageFamilyByUrl(fileUrl) {
  const familyUrls = buildImageFamilyUrls(fileUrl);
  for (const url of familyUrls) {
    await deleteUploadedFileByUrl(url);
  }
}

const imageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, _file, cb) => {
      const uploadContext = parseUploadContext(req);
      const targetDir = uploadContext
        ? path.join(typedImagesDir, uploadContext.entityType, uploadContext.entityId)
        : uploadDir;
      fs.mkdirSync(targetDir, { recursive: true, mode: 0o755 });
      cb(null, targetDir);
    },
    filename: (req, file, cb) => {
      const uploadContext = parseUploadContext(req);
      const targetDir = uploadContext
        ? path.join(typedImagesDir, uploadContext.entityType, uploadContext.entityId)
        : uploadDir;
      cb(null, uniqueFileName(targetDir, file.originalname || 'img.jpg'));
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const mimeType = String(file?.mimetype || '').toLowerCase();
    if (ALLOWED_UPLOAD_MIME_TYPES.has(mimeType)) return cb(null, true);
    return cb(new Error('Solo se permiten archivos de imagen.'));
  }
});

app.use(express.json());

app.use(async (req, res, next) => {
  cleanupExpiredPanelSessions();
  const security = await loadSecuritySettings();
  req.runtimeSecurity = security;

  if (Number(security?.enabled ?? 1) !== 1) {
    return next();
  }

  if (Number(security?.headersEnabled ?? 1) === 1) {
    applySecurityHeaders(res);
  }

  if (
    Number(security?.blockBadUaEnabled ?? 1) === 1 &&
    req.path.startsWith('/api/') &&
    !req.path.startsWith('/api/panel/')
  ) {
    if (isBlockedUserAgent(req.get('user-agent'), security?.blockedUaPatterns)) {
      return res.status(403).json({ error: 'Solicitud bloqueada por politica de seguridad.' });
    }
  }

  if (Number(security?.rateLimitEnabled ?? 1) === 1) {
    if (req.method === 'GET' && req.path.startsWith('/api/products')) {
      const decision = checkRateLimit({
        scope: 'api-products',
        req,
        maxRequests: security.rateLimitMax,
        windowSec: security.rateLimitWindowSec
      });
      if (!decision.allowed) {
        return res.status(429).json({ error: 'Demasiadas solicitudes de productos. Intenta nuevamente en unos segundos.' });
      }
    }

    if (req.method === 'POST' && req.path === '/api/orders') {
      const decision = checkRateLimit({
        scope: 'api-orders',
        req,
        maxRequests: security.orderRateLimitMax,
        windowSec: security.rateLimitWindowSec
      });
      if (!decision.allowed) {
        return res.status(429).json({ error: 'Demasiados intentos de crear pedido. Espera antes de reintentar.' });
      }
    }
  }

  return next();
});

function buildSeoModulesFromSettings(settings) {
  const modules = {
    htmlMeta: Number(settings?.seoHtmlMetaEnabled ?? 1) === 1,
    openGraph: Number(settings?.seoOpenGraphEnabled ?? 1) === 1,
    twitterCards: Number(settings?.seoTwitterCardsEnabled ?? 1) === 1,
    advancedTags: Number(settings?.seoAdvancedTagsEnabled ?? 0) === 1,
    schemaMarkup: Number(settings?.seoSchemaMarkupEnabled ?? 1) === 1
  };

  const legacySocialMetaEnabled = Number(settings?.seoSocialMetaEnabled ?? 1) === 1;
  if (!legacySocialMetaEnabled) {
    modules.openGraph = false;
    modules.twitterCards = false;
  }

  return modules;
}

function hasEnabledSeoModules(modules) {
  return Object.values(modules || {}).some(Boolean);
}

function parseOgImagesJson(raw) {
  const value = String(raw || '').trim();
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function parseHreflangJson(raw) {
  const value = String(raw || '').trim();
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function buildSeoDefaultsFromSettings(settings) {
  return {
    pageTitle: settings?.seoHtmlDefaultTitle || '',
    metaDescription: settings?.seoHtmlDefaultDescription || '',
    metaKeywords: settings?.seoHtmlDefaultKeywords || '',
    author: settings?.seoHtmlAuthor || '',
    robotsIndex: Number(settings?.seoHtmlRobotsIndexEnabled ?? 1) === 1,
    robotsFollow: Number(settings?.seoHtmlRobotsFollowEnabled ?? 1) === 1,
    contentLanguage: settings?.seoHtmlContentLanguage || 'es',
    geoRegion: settings?.seoHtmlGeoRegion || '',
    geoPlaceName: settings?.seoHtmlGeoPlaceName || '',
    geoPosition: settings?.seoHtmlGeoPosition || '',
    ogTitle: settings?.seoOgDefaultTitle || '',
    ogDescription: settings?.seoOgDefaultDescription || '',
    ogImages: parseOgImagesJson(settings?.seoOgImagesJson),
    ogUrl: settings?.seoOgUrl || '',
    ogType: settings?.seoOgType || 'website',
    ogSiteName: settings?.seoOgSiteName || '',
    ogLocale: settings?.seoOgLocale || '',
    twitterCardType: settings?.seoTwitterCardType || 'summary_large_image',
    twitterTitle: settings?.seoTwitterTitle || '',
    twitterDescription: settings?.seoTwitterDescription || '',
    twitterImage: settings?.seoTwitterImageUrl || '',
    twitterSite: settings?.seoTwitterSiteHandle || '',
    twitterCreator: settings?.seoTwitterCreatorHandle || '',
    canonicalUrl: settings?.seoAdvancedCanonicalUrl || '',
    advancedNoArchive: Number(settings?.seoAdvancedNoArchiveEnabled ?? 0) === 1,
    advancedNoSnippet: Number(settings?.seoAdvancedNoSnippetEnabled ?? 0) === 1,
    advancedNoImageIndex: Number(settings?.seoAdvancedNoImageIndexEnabled ?? 0) === 1,
    advancedMaxSnippet: settings?.seoAdvancedMaxSnippet || '',
    advancedMaxImagePreview: settings?.seoAdvancedMaxImagePreview || 'large',
    advancedMaxVideoPreview: settings?.seoAdvancedMaxVideoPreview || '',
    advancedUnavailableAfter: settings?.seoAdvancedUnavailableAfter || '',
    advancedGooglebotRules: settings?.seoAdvancedGooglebotRules || '',
    advancedGooglebotNewsRules: settings?.seoAdvancedGooglebotNewsRules || '',
    advancedHreflang: parseHreflangJson(settings?.seoAdvancedHreflangJson),
    schemaType: settings?.seoSchemaType || 'Article',
    schemaName: settings?.seoSchemaName || '',
    schemaDescription: settings?.seoSchemaDescription || '',
    schemaImageUrl: settings?.seoSchemaImageUrl || '',
    schemaUrl: settings?.seoSchemaUrl || '',
    schemaAuthor: settings?.seoSchemaAuthor || '',
    schemaDatePublished: settings?.seoSchemaDatePublished || '',
    schemaHeadline: settings?.seoSchemaHeadline || ''
  };
}

async function renderHtmlWithSeo(req, res, next, { templateName, buildTags }) {
  try {
    const templatePath = path.join(__dirname, 'public', templateName);
    const templateHtml = await fs.promises.readFile(templatePath, 'utf8');
    const settings = await getSettings().catch(() => null);
    const seoModules = buildSeoModulesFromSettings(settings);
    const seoDefaults = buildSeoDefaultsFromSettings(settings);

    if (!hasEnabledSeoModules(seoModules)) {
      return res.type('html').send(injectSocialMetaIntoHtml(templateHtml, ''));
    }

    const tags = (await buildTags({ req, settings, seoModules, seoDefaults })) || '';
    return res.type('html').send(injectSocialMetaIntoHtml(templateHtml, tags));
  } catch (error) {
    return next(error);
  }
}

app.get(['/', '/index.html'], async (req, res, next) => {
  return renderHtmlWithSeo(req, res, next, {
    templateName: 'index.html',
    buildTags: async ({ req, settings, seoModules, seoDefaults }) => {
      const baseUrl = getRequestBaseUrl(req);
      const storeName = settings?.storeName || 'SLStore';
      const canonicalUrl = `${baseUrl}/`;
      return buildSeoMetaTags({
        storeName,
        canonicalUrl,
        baseUrl,
        modules: seoModules,
        defaults: seoDefaults,
        publication: {
          title: 'Inicio',
          description: 'Elegi productos deportivos, arma tu pedido y confirmalo por WhatsApp con el vendedor.',
          keywords: `${storeName}, tienda deportiva, catalogo, futbol, entrenamiento`,
          ogType: 'website',
          schemaType: 'WebSite',
          includeStoreInTitle: true
        }
      });
    }
  });
});

app.get('/cart.html', async (req, res, next) => {
  return renderHtmlWithSeo(req, res, next, {
    templateName: 'cart.html',
    buildTags: async ({ req, settings, seoModules, seoDefaults }) => {
      const baseUrl = getRequestBaseUrl(req);
      const storeName = settings?.storeName || 'SLStore';
      const canonicalUrl = `${baseUrl}/cart.html`;
      return buildSeoMetaTags({
        storeName,
        canonicalUrl,
        baseUrl,
        modules: seoModules,
        defaults: seoDefaults,
        publication: {
          title: 'Carrito',
          description: 'Revisa tu pedido, valida cantidades y continua la compra por WhatsApp.',
          keywords: `${storeName}, carrito, pedido, compra por whatsapp`,
          ogType: 'website',
          schemaType: 'WebPage',
          includeStoreInTitle: true
        }
      });
    }
  });
});

app.get('/help.html', async (req, res, next) => {
  return renderHtmlWithSeo(req, res, next, {
    templateName: 'help.html',
    buildTags: async ({ req, settings, seoModules, seoDefaults }) => {
      const baseUrl = getRequestBaseUrl(req);
      const storeName = settings?.storeName || 'SLStore';
      const page = await getPageBySlug('help').catch(() => null);
      const title = page?.title || 'Ayuda';
      const description = page?.contentHtml || 'Guia para armar pedidos prolijos y cerrarlos por WhatsApp.';
      const canonicalUrl = `${baseUrl}/help.html`;
      const pageImage =
        page?.images?.[0]?.sliderUrl ||
        page?.images?.[0]?.url ||
        page?.imageUrl ||
        '';
      return buildSeoMetaTags({
        storeName,
        canonicalUrl,
        imageUrl: pageImage,
        baseUrl,
        modules: seoModules,
        defaults: seoDefaults,
        publication: {
          title,
          description,
          keywords: `${storeName}, ayuda, como comprar, pedidos por whatsapp`,
          ogType: 'article',
          schemaType: 'Article',
          includeStoreInTitle: true
        }
      });
    }
  });
});

app.get(['/security.html', '/seguridad.html'], async (req, res, next) => {
  return renderHtmlWithSeo(req, res, next, {
    templateName: 'security.html',
    buildTags: async ({ req, settings, seoModules, seoDefaults }) => {
      const baseUrl = getRequestBaseUrl(req);
      const storeName = settings?.storeName || 'SLStore';
      const page = await getPageBySlug('security').catch(() => null);
      const title = page?.title || 'Seguridad';
      const canonicalUrl = `${baseUrl}/security.html`;
      const pageImage =
        page?.images?.[0]?.sliderUrl ||
        page?.images?.[0]?.url ||
        page?.imageUrl ||
        '';
      return buildSeoMetaTags({
        storeName,
        canonicalUrl,
        imageUrl: pageImage,
        baseUrl,
        modules: seoModules,
        defaults: seoDefaults,
        publication: {
          title,
          description: 'Guia de seguridad web y anti-scrape para proteger contenido, trafico y recursos del sitio.',
          keywords: `${storeName}, seguridad web, anti scrape, proteccion de contenido`,
          ogType: 'article',
          schemaType: 'Article',
          includeStoreInTitle: true
        }
      });
    }
  });
});

app.get('/product.html', async (req, res, next) => {
  return renderHtmlWithSeo(req, res, next, {
    templateName: 'product.html',
    buildTags: async ({ req, settings, seoModules, seoDefaults }) => {
      const productId = parseProductId(req.query?.id);
      if (!productId) return '';

      const product = await getProductById(productId);
      if (!product) return '';

      const baseUrl = getRequestBaseUrl(req);
      const canonicalUrl = `${baseUrl}/product.html?id=${productId}`;
      const primarySliderImage =
        product?.images?.[0]?.sliderUrl ||
        product?.imageSliderUrl ||
        product?.imageUrl ||
        '';

      return buildProductSocialMetaTags({
        storeName: settings?.storeName || 'SLStore',
        product,
        canonicalUrl,
        imageUrl: primarySliderImage,
        baseUrl,
        modules: seoModules,
        defaults: seoDefaults
      });
    }
  });
});

app.get('/sitemap.xml', async (req, res) => {
  try {
    const settings = await getSettings().catch(() => null);
    const moduleEnabled = Number(settings?.seoTechFilesEnabled ?? 1) === 1;
    const sitemapEnabled = Number(settings?.seoSitemapGeneratorEnabled ?? 1) === 1;
    if (!moduleEnabled || !sitemapEnabled) {
      return res.status(404).type('text/plain').send('Sitemap deshabilitado.');
    }

    const products = await getProducts().catch(() => []);
    const baseUrl = getRequestBaseUrl(req);
    const xml = buildSitemapXml({ baseUrl, products });
    return res.type('application/xml').send(xml);
  } catch (_error) {
    return res.status(500).type('text/plain').send('No se pudo generar sitemap.xml');
  }
});

app.get('/robots.txt', async (req, res) => {
  try {
    const settings = await getSettings().catch(() => null);
    const moduleEnabled = Number(settings?.seoTechFilesEnabled ?? 1) === 1;
    const robotsEnabled = Number(settings?.seoRobotsTxtEnabled ?? 1) === 1;
    const baseUrl = getRequestBaseUrl(req);
    const sitemapUrl = `${baseUrl}/sitemap.xml`;

    let robotsText = String(settings?.seoRobotsTxtContent || '').trim();
    if (!moduleEnabled || !robotsEnabled) {
      robotsText = ['User-agent: *', 'Disallow: /'].join('\n');
    } else if (!robotsText) {
      const canIndex = Number(settings?.seoHtmlRobotsIndexEnabled ?? 1) === 1;
      robotsText = canIndex
        ? ['User-agent: *', 'Allow: /', `Sitemap: ${sitemapUrl}`].join('\n')
        : ['User-agent: *', 'Disallow: /', `Sitemap: ${sitemapUrl}`].join('\n');
    } else {
      robotsText = applyTextTemplate(robotsText, {
        baseurl: baseUrl,
        siteurl: baseUrl,
        sitemapurl: sitemapUrl
      });
    }

    const out = robotsText.endsWith('\n') ? robotsText : `${robotsText}\n`;
    return res.type('text/plain; charset=utf-8').send(out);
  } catch (_error) {
    return res.status(500).type('text/plain').send('No se pudo generar robots.txt');
  }
});

app.get('/htaccess.txt', async (req, res) => {
  try {
    const settings = await getSettings().catch(() => null);
    const moduleEnabled = Number(settings?.seoTechFilesEnabled ?? 1) === 1;
    const htaccessEnabled = Number(settings?.seoHtaccessEnabled ?? 0) === 1;
    if (!moduleEnabled || !htaccessEnabled) {
      return res.status(404).type('text/plain').send('htaccess deshabilitado.');
    }

    const baseUrl = getRequestBaseUrl(req);
    const sitemapUrl = `${baseUrl}/sitemap.xml`;
    const configured = String(settings?.seoHtaccessContent || '').trim();
    const fallback = [
      '# SLStore htaccess',
      '# Sitemap: {{sitemapUrl}}',
      '<IfModule mod_rewrite.c>',
      '  RewriteEngine On',
      '</IfModule>'
    ].join('\n');
    const text = applyTextTemplate(configured || fallback, {
      baseurl: baseUrl,
      siteurl: baseUrl,
      sitemapurl: sitemapUrl
    });
    const out = text.endsWith('\n') ? text : `${text}\n`;
    return res.type('text/plain; charset=utf-8').send(out);
  } catch (_error) {
    return res.status(500).type('text/plain').send('No se pudo generar htaccess.');
  }
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/panel', express.static(path.join(__dirname, 'public', 'panel')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'carthtml-api' });
});

app.get('/api/products', async (_req, res) => {
  try {
    const products = await getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron cargar los productos.' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = Number(req.params.id);
    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: 'ID de producto inválido.' });
    }

    const product = await getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo cargar el producto.' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customer, items } = req.body;
    const security = req.runtimeSecurity || (await loadSecuritySettings());
    if (Number(security?.enabled ?? 1) === 1 && Number(security?.honeypotEnabled ?? 1) === 1) {
      const hpField = String(security?.honeypotField || 'website').trim() || 'website';
      const trapValue = String(customer?.[hpField] ?? req.body?.[hpField] ?? '').trim();
      if (trapValue) {
        return res.status(400).json({ error: 'Solicitud invalida.' });
      }
    }

    if (!customer || !customer.name || !customer.phone || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Datos de pedido inválidos.' });
    }

    const settings = await getSettings();
    const whatsappNumber = settings?.whatsappNumber || WHATSAPP_NUMBER;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const order = await createOrder({ customer, items, whatsappNumber, baseUrl });
    return res.status(201).json(order);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'No se pudo crear el pedido.' });
  }
});

app.get('/api/site-config', async (_req, res) => {
  try {
    const settings = await getSettings();
    const storeName = String(settings?.storeName || process.env.STORE_NAME || 'SLStore').trim();
    const whatsappNumber = String(settings?.whatsappNumber || WHATSAPP_NUMBER || '')
      .replace(/\D+/g, '')
      .slice(0, 20);
    return res.json({
      storeName,
      storeLogoUrl: String(settings?.storeLogoUrl || '').trim(),
      storeFaviconUrl: String(settings?.storeFaviconUrl || '').trim(),
      whatsappNumber,
      socialInstagramUrl: String(settings?.templateSocialInstagramUrl || settings?.socialInstagramUrl || '').trim(),
      socialFacebookUrl: String(settings?.templateSocialFacebookUrl || settings?.socialFacebookUrl || '').trim(),
      socialYoutubeUrl: String(settings?.templateSocialYoutubeUrl || settings?.socialYoutubeUrl || '').trim(),
      socialXUrl: String(settings?.templateSocialXUrl || settings?.socialXUrl || '').trim(),
      templateHeadingFont: String(settings?.templateHeadingFont || 'space-grotesk').trim(),
      templateBodyFont: String(settings?.templateBodyFont || 'inter').trim(),
      templateHeadingColor: String(settings?.templateHeadingColor || '#ffffff').trim(),
      templateBodyColor: String(settings?.templateBodyColor || '#e2e8f0').trim(),
      templateHeadingScale: Number(settings?.templateHeadingScale || 1),
      templateHeadingSizePx: Number(settings?.templateHeadingSizePx || 32),
      templateBodySizePx: Number(settings?.templateBodySizePx || 16),
      templateGoogleAnalyticsId: String(settings?.templateGoogleAnalyticsId || '').trim()
    });
  } catch (_error) {
    return res.json({
      storeName: String(process.env.STORE_NAME || 'SLStore').trim(),
      storeLogoUrl: '',
      storeFaviconUrl: '',
      whatsappNumber: String(WHATSAPP_NUMBER || '')
        .replace(/\D+/g, '')
        .slice(0, 20),
      socialInstagramUrl: '',
      socialFacebookUrl: '',
      socialYoutubeUrl: '',
      socialXUrl: '',
      templateHeadingFont: 'space-grotesk',
      templateBodyFont: 'inter',
      templateHeadingColor: '#ffffff',
      templateBodyColor: '#e2e8f0',
      templateHeadingScale: 1,
      templateHeadingSizePx: 32,
      templateBodySizePx: 16,
      templateGoogleAnalyticsId: ''
    });
  }
});

app.get('/api/pages/:slug', async (req, res) => {
  try {
    const page = await getPageBySlug(req.params.slug);
    if (!page) {
      return res.status(404).json({ error: 'Pagina no encontrada.' });
    }

    return res.json(page);
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo cargar la pagina.' });
  }
});

app.post('/api/panel/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y clave son obligatorios.' });
    }

    const loginDecision = checkRateLimit({
      scope: 'panel-login',
      req,
      maxRequests: 20,
      windowSec: 10 * 60
    });
    if (!loginDecision.allowed) {
      return res.status(429).json({ error: 'Demasiados intentos de login. Espera antes de reintentar.' });
    }

    const user = await authenticateUser(username, password);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales invalidas.' });
    }
    const session = createPanelSession(user);
    setPanelSessionCookie(res, session.token, session.expiresAt);
    return res.json({
      ok: true,
      user
    });
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo iniciar sesion.' });
  }
});

app.post('/api/panel/logout', (req, res) => {
  const token = getPanelSessionToken(req);
  if (token) {
    panelSessions.delete(token);
  }
  clearPanelSessionCookie(res);
  return res.json({ ok: true });
});

app.get('/api/panel/session', (req, res) => {
  const session = getPanelSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Sesion requerida.' });
  }
  return res.json({
    ok: true,
    user: {
      id: session.userId,
      username: session.username,
      role: session.role
    }
  });
});

app.use('/api/panel', requirePanelAuth);

app.get('/api/panel/dashboard-summary', async (_req, res) => {
  try {
    const dbSummary = await getDashboardSummary();
    const uploadsSizeBytes = await getDirSizeBytes(uploadDir);

    const memoryTotalBytes = Number(os.totalmem() || 0);
    const memoryFreeBytes = Number(os.freemem() || 0);
    const memoryUsedBytes = Math.max(0, memoryTotalBytes - memoryFreeBytes);
    const cpuCores = Array.isArray(os.cpus()) ? os.cpus().length : 0;
    const load = Array.isArray(os.loadavg()) ? os.loadavg() : [0, 0, 0];
    const cpuLoadPercent = cpuCores > 0 ? Math.min(100, (Number(load[0] || 0) / cpuCores) * 100) : 0;

    let disk = null;
    try {
      if (typeof fs.promises.statfs === 'function') {
        const statfs = await fs.promises.statfs(uploadDir);
        const blockSize = Number(statfs.bsize || statfs.frsize || 0);
        const totalBytes = Number(statfs.blocks || 0) * blockSize;
        const freeBytes = Number(statfs.bavail || statfs.bfree || 0) * blockSize;
        const usedBytes = Math.max(0, totalBytes - freeBytes);
        disk = { totalBytes, freeBytes, usedBytes };
      }
    } catch (_error) {
      disk = null;
    }

    return res.json({
      counts: {
        products: dbSummary.productsCount,
        categories: dbSummary.categoriesCount,
        orders: dbSummary.ordersCount,
        images: dbSummary.imagesCount
      },
      storage: {
        uploadsBytes: uploadsSizeBytes,
        dbBytes: dbSummary.dbSizeBytes,
        appUsedBytes: uploadsSizeBytes + Number(dbSummary.dbSizeBytes || 0),
        disk
      },
      memory: {
        totalBytes: memoryTotalBytes,
        usedBytes: memoryUsedBytes,
        freeBytes: memoryFreeBytes,
        usedPercent: memoryTotalBytes > 0 ? (memoryUsedBytes / memoryTotalBytes) * 100 : 0
      },
      cpu: {
        cores: cpuCores,
        load1m: Number(load[0] || 0),
        load5m: Number(load[1] || 0),
        load15m: Number(load[2] || 0),
        loadPercent: cpuLoadPercent
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo cargar el resumen del dashboard.' });
  }
});

app.get('/api/panel/uploads/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'panel-uploads',
    endpoint: '/api/panel/uploads/image',
    uploadDir: '/public/uploads',
    typedImagesDir: '/public/uploads/images/:entityType/:entityId',
    backwardCompat: 'Acepta productId y lo mapea a entityType=product',
    variants: IMAGE_VARIANTS
  });
});

app.post('/api/panel/uploads/image', (req, res) => {
  imageUpload.single('image')(req, res, async (error) => {
    if (error) {
      return res.status(400).json({ error: error.message || 'No se pudo subir la imagen.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió archivo.' });
    }

    const validation = await validateUploadedFileType(req.file);
    if (!validation.ok) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch (_unlinkError) {
        // best effort
      }
      return res.status(400).json({ error: validation.reason });
    }

    const uploadContext = parseUploadContext(req);
    const url = publicUrlForUpload(uploadContext, req.file.filename);
    let variants = { sliderUrl: url, cardUrl: url };
    try {
      variants = await generateImageVariants(req.file, uploadContext);
    } catch (variantError) {
      await deleteUploadedImageFamilyByUrl(url);
      return res.status(500).json({ error: 'No se pudieron generar variantes de imagen.' });
    }

    return res.status(201).json({
      ok: true,
      fileName: req.file.filename,
      entityType: uploadContext?.entityType || null,
      entityId: uploadContext?.entityId || null,
      url,
      originalUrl: url,
      sliderUrl: variants.sliderUrl,
      cardUrl: variants.cardUrl
    });
  });
});

app.post('/api/panel/uploads/images', (req, res) => {
  imageUpload.array('images', 20)(req, res, async (error) => {
    if (error) {
      return res.status(400).json({ error: error.message || 'No se pudieron subir las imagenes.' });
    }

    if (!Array.isArray(req.files) || !req.files.length) {
      return res.status(400).json({ error: 'No se recibieron archivos.' });
    }

    for (const file of req.files) {
      const validation = await validateUploadedFileType(file);
      if (!validation.ok) {
        try {
          await fs.promises.unlink(file.path);
        } catch (_unlinkError) {
          // best effort
        }
        return res.status(400).json({ error: validation.reason });
      }
    }

    const uploadContext = parseUploadContext(req);
    const files = [];
    for (const file of req.files) {
      const url = publicUrlForUpload(uploadContext, file.filename);
      try {
        const variants = await generateImageVariants(file, uploadContext);
        files.push({
          fileName: file.filename,
          entityType: uploadContext?.entityType || null,
          entityId: uploadContext?.entityId || null,
          url,
          originalUrl: url,
          sliderUrl: variants.sliderUrl,
          cardUrl: variants.cardUrl
        });
      } catch (_variantError) {
        await deleteUploadedImageFamilyByUrl(url);
        return res.status(500).json({ error: 'No se pudieron generar variantes de imagen.' });
      }
    }

    return res.status(201).json({
      ok: true,
      files,
      urls: files.map((file) => file.url)
    });
  });
});

app.get('/api/panel/users', async (_req, res) => {
  try {
    res.json(await listUsers());
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron cargar usuarios.' });
  }
});

app.post('/api/panel/users', async (req, res) => {
  try {
    res.status(201).json(await createUser(req.body || {}));
  } catch (error) {
    res.status(400).json({ error: error.message || 'No se pudo crear usuario.' });
  }
});

app.put('/api/panel/users/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
    const updated = await updateUser(id, req.body || {});
    if (!updated) return res.status(404).json({ error: 'Usuario no encontrado.' });
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'No se pudo actualizar usuario.' });
  }
});

app.delete('/api/panel/users/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
    const ok = await deleteUser(id);
    if (!ok) return res.status(404).json({ error: 'Usuario no encontrado.' });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo eliminar usuario.' });
  }
});

app.get('/api/panel/settings', async (_req, res) => {
  try {
    res.json(await listSettings());
  } catch (error) {
    res.status(500).json({ error: 'No se pudo cargar configuración.' });
  }
});

app.put('/api/panel/settings/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
    if (id !== 1) return res.status(400).json({ error: 'Solo existe una configuración principal.' });
    const updated = await updateSettings(req.body || {});
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'No se pudo actualizar configuración.' });
  }
});

app.get('/api/panel/categories', async (_req, res) => {
  try {
    res.json(await listCategories());
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron cargar categorías.' });
  }
});

app.post('/api/panel/categories', async (req, res) => {
  try {
    res.status(201).json(await createCategory(req.body || {}));
  } catch (error) {
    res.status(400).json({ error: error.message || 'No se pudo crear categoría.' });
  }
});

app.put('/api/panel/categories/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
    const updated = await updateCategory(id, req.body || {});
    if (!updated) return res.status(404).json({ error: 'Categoría no encontrada.' });
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'No se pudo actualizar categoría.' });
  }
});

app.delete('/api/panel/categories/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
    const ok = await deleteCategory(id);
    if (!ok) return res.status(404).json({ error: 'Categoría no encontrada.' });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo eliminar categoría.' });
  }
});

app.get('/api/panel/orders', async (_req, res) => {
  try {
    res.json(await listOrdersAdmin());
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron cargar los pedidos.' });
  }
});

app.get('/api/panel/orders/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
    const order = await getOrderAdminById(id);
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado.' });
    return res.json(order);
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo cargar el pedido.' });
  }
});

app.post('/api/panel/orders', async (req, res) => {
  try {
    res.status(201).json(await createOrderAdmin(req.body || {}));
  } catch (error) {
    res.status(400).json({ error: error.message || 'No se pudo crear el pedido.' });
  }
});

app.put('/api/panel/orders/:id', async (req, res) => {
  try {
    const order = await updateOrderAdmin(Number(req.params.id), req.body || {});
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado.' });
    return res.json(order);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'No se pudo actualizar el pedido.' });
  }
});

app.delete('/api/panel/orders/:id', async (req, res) => {
  try {
    const ok = await deleteOrderAdmin(Number(req.params.id));
    if (!ok) return res.status(404).json({ error: 'Pedido no encontrado.' });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo eliminar el pedido.' });
  }
});

app.get('/api/panel/product-images', async (_req, res) => {
  try {
    res.json(await listProductImages());
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron cargar imágenes.' });
  }
});

app.post('/api/panel/product-images', async (req, res) => {
  try {
    res.status(201).json(await createProductImage(req.body || {}));
  } catch (error) {
    res.status(400).json({ error: error.message || 'No se pudo crear imagen.' });
  }
});

app.put('/api/panel/product-images/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
    const updated = await updateProductImage(id, req.body || {});
    if (!updated) return res.status(404).json({ error: 'Imagen no encontrada.' });
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'No se pudo actualizar imagen.' });
  }
});

app.delete('/api/panel/product-images/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
    const current = await getProductImageById(id);
    const ok = await deleteProductImage(id);
    if (!ok) return res.status(404).json({ error: 'Imagen no encontrada.' });
    if (current && current.url) {
      await deleteUploadedImageFamilyByUrl(current.url);
    }
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo eliminar imagen.' });
  }
});

app.get('/api/panel/page-images', async (_req, res) => {
  try {
    res.json(await listPageImages());
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron cargar imagenes de paginas.' });
  }
});

app.post('/api/panel/page-images', async (req, res) => {
  try {
    res.status(201).json(await createPageImage(req.body || {}));
  } catch (error) {
    res.status(400).json({ error: error.message || 'No se pudo crear imagen de pagina.' });
  }
});

app.put('/api/panel/page-images/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
    const updated = await updatePageImage(id, req.body || {});
    if (!updated) return res.status(404).json({ error: 'Imagen de pagina no encontrada.' });
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'No se pudo actualizar imagen de pagina.' });
  }
});

app.delete('/api/panel/page-images/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
    const current = await getPageImageById(id);
    const ok = await deletePageImage(id);
    if (!ok) return res.status(404).json({ error: 'Imagen de pagina no encontrada.' });
    if (current && current.url) {
      await deleteUploadedImageFamilyByUrl(current.url);
    }
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo eliminar imagen de pagina.' });
  }
});

app.get('/api/panel/pages', async (_req, res) => {
  try {
    res.json(await listPages());
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron cargar páginas.' });
  }
});

app.post('/api/panel/pages', async (req, res) => {
  try {
    res.status(201).json(await createPage(req.body || {}));
  } catch (error) {
    res.status(400).json({ error: error.message || 'No se pudo crear página.' });
  }
});

app.put('/api/panel/pages/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
    const updated = await updatePage(id, req.body || {});
    if (!updated) return res.status(404).json({ error: 'Página no encontrada.' });
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'No se pudo actualizar página.' });
  }
});

app.patch('/api/panel/pages/:id/image', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { imageUrl } = req.body || {};
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
    if (!String(imageUrl || '').trim()) return res.status(400).json({ error: 'imageUrl es obligatorio.' });
    const updated = await setPageMainImage(id, imageUrl);
    if (!updated) return res.status(404).json({ error: 'Pagina no encontrada.' });
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'No se pudo actualizar imagen principal de pagina.' });
  }
});

app.delete('/api/panel/pages/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
    const images = await listPageImagesByPageId(id);
    const ok = await deletePage(id);
    if (!ok) return res.status(404).json({ error: 'Página no encontrada.' });
    if (Array.isArray(images)) {
      for (const image of images) {
        await deleteUploadedImageFamilyByUrl(image.url);
      }
    }
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo eliminar página.' });
  }
});

app.get('/api/panel/products', async (_req, res) => {
  try {
    res.json(await listProductsAdmin());
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron cargar productos.' });
  }
});

app.post('/api/panel/products', async (req, res) => {
  try {
    res.status(201).json(await createProductAdmin(req.body || {}));
  } catch (error) {
    res.status(400).json({ error: error.message || 'No se pudo crear producto.' });
  }
});

app.put('/api/panel/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
    const updated = await updateProductAdmin(id, req.body || {});
    if (!updated) return res.status(404).json({ error: 'Producto no encontrado.' });
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'No se pudo actualizar producto.' });
  }
});

app.patch('/api/panel/products/:id/image', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { imageUrl } = req.body || {};
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
    if (!String(imageUrl || '').trim()) return res.status(400).json({ error: 'imageUrl es obligatorio.' });
    const updated = await setProductMainImage(id, imageUrl);
    if (!updated) return res.status(404).json({ error: 'Producto no encontrado.' });
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'No se pudo actualizar imagen principal.' });
  }
});

app.post('/api/panel/products/images/alt/regenerate', async (_req, res) => {
  try {
    const result = await regenerateAllProductImageAltTexts();
    return res.json({
      ok: true,
      ...result
    });
  } catch (error) {
    if (error && /desactivado/i.test(String(error.message || ''))) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'No se pudieron regenerar los ALT de imagenes.' });
  }
});

app.get('/api/panel/security-settings', async (_req, res) => {
  try {
    return res.json(await loadSecuritySettings(true));
  } catch (_error) {
    return res.status(500).json({ error: 'No se pudo cargar configuracion de seguridad.' });
  }
});

app.put('/api/panel/security-settings', async (req, res) => {
  try {
    const updated = await updateSecuritySettings(req.body || {});
    await loadSecuritySettings(true);
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'No se pudo guardar configuracion de seguridad.' });
  }
});

app.get('/api/panel/security-status', async (_req, res) => {
  try {
    const settings = await loadSecuritySettings(true);
    return res.json({
      ok: true,
      settings,
      runtime: {
        activeRateBuckets: rateLimitBuckets.size,
        cacheAgeMs: Math.max(0, Date.now() - cachedSecuritySettingsAt)
      }
    });
  } catch (_error) {
    return res.status(500).json({ error: 'No se pudo cargar estado de seguridad.' });
  }
});

app.delete('/api/panel/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
    const images = await listProductImagesByProductId(id);
    const ok = await deleteProductAdmin(id);
    if (!ok) return res.status(404).json({ error: 'Producto no encontrado.' });
    if (Array.isArray(images)) {
      for (const image of images) {
        await deleteUploadedImageFamilyByUrl(image.url);
      }
    }
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo eliminar producto.' });
  }
});

app.get('/panel', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'panel', 'index.html'));
});

app.get(['/panel/security', '/panel/seguridad'], (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'panel', 'security.html'));
});

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

initDb()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Servidor activo en http://localhost:${PORT}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`El puerto ${PORT} ya está en uso.`);
        console.error('Liberá el proceso que lo usa o iniciá con otro puerto: PORT=3001 npm start');
        process.exit(1);
      }

      console.error('Error levantando el servidor:', error);
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error('Error iniciando la base de datos:', error);
    process.exit(1);
  });
