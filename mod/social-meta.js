function escapeHtmlAttr(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function decodeHtmlEntities(value) {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function normalizeText(value, maxLength = 180) {
  const decoded = decodeHtmlEntities(value);
  return String(decoded || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function normalizeKeywords(value) {
  return String(value || '')
    .split(',')
    .map((entry) => normalizeText(entry, 80))
    .filter(Boolean)
    .slice(0, 25)
    .join(', ');
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

function normalizeDirectiveNumber(value, max = 100000) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  const parsed = Number(raw);
  if (!Number.isInteger(parsed)) return '';
  if (parsed < -1) return '-1';
  if (parsed > max) return String(max);
  return String(parsed);
}

function normalizeAdvancedImagePreview(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase();
  const allowed = new Set(['none', 'standard', 'large']);
  return allowed.has(normalized) ? normalized : 'large';
}

function normalizeDirectiveText(value, maxLength = 240) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function applyTemplate(value, vars = {}) {
  const raw = String(value || '');
  if (!raw) return '';

  return raw
    .replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (_full, key) => {
      const normalizedKey = String(key || '').trim().toLowerCase();
      const mapped = vars[normalizedKey];
      return mapped === undefined || mapped === null ? '' : String(mapped);
    })
    .trim();
}

function normalizeHreflangEntries(values = [], baseUrl = '') {
  const list = Array.isArray(values) ? values : [];
  const normalized = [];
  const seen = new Set();

  list.forEach((item) => {
    const rawLang = typeof item === 'string' ? item : item?.lang || '';
    const rawUrl = typeof item === 'object' ? item?.url || '' : '';
    const lang = String(rawLang || '')
      .trim()
      .toLowerCase();
    const url = toAbsoluteUrl(baseUrl, rawUrl);
    if (!lang || !url) return;
    if (!/^(x-default|[a-z]{2,3}(?:-[a-z0-9]{2,8})*)$/i.test(lang)) return;
    const key = `${lang}|${url}`;
    if (seen.has(key)) return;
    seen.add(key);
    normalized.push({ lang, url });
  });

  return normalized.slice(0, 20);
}

function normalizeOgImageEntries(values = [], baseUrl = '') {
  const list = Array.isArray(values) ? values : [];
  const normalized = [];
  const seen = new Set();

  for (const item of list) {
    const rawUrl = typeof item === 'string' ? item : item?.url || '';
    const url = toAbsoluteUrl(baseUrl, rawUrl);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    normalized.push({
      url,
      isPrimary: Boolean(typeof item === 'object' && item?.isPrimary)
    });
  }

  if (!normalized.length) return [];
  const primaryIndex = normalized.findIndex((entry) => entry.isPrimary);
  if (primaryIndex > 0) {
    const [primary] = normalized.splice(primaryIndex, 1);
    normalized.unshift(primary);
  } else if (primaryIndex === -1) {
    normalized[0].isPrimary = true;
  }

  return normalized;
}

function toAbsoluteUrl(baseUrl, maybeUrl) {
  const raw = String(maybeUrl || '').trim();
  if (!raw) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  if (raw.startsWith('//')) return `https:${raw}`;
  if (raw.startsWith('/')) return `${baseUrl}${raw}`;
  return `${baseUrl}/${raw}`;
}

function asEnabled(value, fallback = true) {
  if (value === undefined || value === null) return fallback;
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return numeric === 1;
  return fallback;
}

function ensureTitle(rawTitle, storeName, includeStoreInTitle = true) {
  const store = normalizeText(storeName || 'SLStore', 80);
  const titleBase = normalizeText(rawTitle || store || 'SLStore', 120);
  if (!includeStoreInTitle || !store) return titleBase;
  if (titleBase.toLowerCase().includes(store.toLowerCase())) return titleBase;
  return normalizeText(`${titleBase} | ${store}`, 140);
}

function buildKeywords({ storeName, product }) {
  const set = new Set([
    normalizeText(storeName || 'SLStore', 60),
    normalizeText(product?.name || '', 80),
    normalizeText(product?.category || '', 60),
    'tienda deportiva',
    'indumentaria deportiva'
  ]);

  if (Array.isArray(product?.categories)) {
    product.categories.forEach((category) => set.add(normalizeText(category, 60)));
  }

  return Array.from(set)
    .map((entry) => String(entry || '').trim())
    .filter(Boolean)
    .join(', ');
}

function toSafeJsonLdString(jsonObject) {
  return JSON.stringify(jsonObject)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

function buildDefaultSchemaData({
  schemaType,
  title,
  description,
  canonicalUrl,
  imageUrl,
  storeName,
  defaults = {},
  baseUrl = ''
}) {
  const type = normalizeText(defaults.schemaType || schemaType || 'WebPage', 40) || 'WebPage';
  const fallbackUrl = toAbsoluteUrl(baseUrl, canonicalUrl || '');
  const fallbackImage = toAbsoluteUrl(baseUrl, imageUrl || '');
  const storeLabel = normalizeText(storeName || 'SLStore', 80);
  const baseTemplateVars = {
    title: normalizeText(title || '', 180),
    description: normalizeText(description || '', 320),
    url: fallbackUrl,
    image: fallbackImage,
    store: storeLabel,
    store_name: storeLabel
  };

  const configuredUrl = applyTemplate(defaults.schemaUrl, baseTemplateVars);
  const url = toAbsoluteUrl(baseUrl, configuredUrl || fallbackUrl);

  const configuredImage = applyTemplate(defaults.schemaImageUrl, {
    ...baseTemplateVars,
    url
  });
  const image = toAbsoluteUrl(baseUrl, configuredImage || fallbackImage);

  const schemaTemplateVars = {
    ...baseTemplateVars,
    url,
    image
  };

  const name = normalizeText(applyTemplate(defaults.schemaName, schemaTemplateVars) || title || storeLabel || 'SLStore', 180);
  const schemaDescription = normalizeText(
    applyTemplate(defaults.schemaDescription, {
      ...schemaTemplateVars,
      title: name || schemaTemplateVars.title,
      description: schemaTemplateVars.description
    }) || description || '',
    320
  );
  const author = normalizeText(applyTemplate(defaults.schemaAuthor, schemaTemplateVars), 120);
  const datePublished = normalizeText(applyTemplate(defaults.schemaDatePublished, schemaTemplateVars), 64);
  const headline = normalizeText(
    applyTemplate(defaults.schemaHeadline, {
      ...schemaTemplateVars,
      title: name || schemaTemplateVars.title
    }) || name || '',
    180
  );

  const schema = {
    '@context': 'https://schema.org',
    '@type': type,
    name,
    description: schemaDescription || undefined,
    url: url || undefined,
    image: image ? [image] : undefined,
    isPartOf: {
      '@type': 'WebSite',
      name: storeLabel,
      url: url || undefined
    }
  };

  if (headline) {
    schema.headline = headline;
  }
  if (author) {
    schema.author = {
      '@type': 'Person',
      name: author
    };
  }
  if (datePublished) {
    schema.datePublished = datePublished;
  }

  return schema;
}

function buildProductSchemaData({ storeName, product, canonicalUrl, imageUrl }) {
  const productName = normalizeText(product?.name || 'Producto', 140);
  const description = normalizeText(product?.description || 'Producto deportivo.', 240);
  const category = normalizeText(product?.category || product?.categories?.[0] || 'Deportes', 80);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    description,
    category,
    image: imageUrl ? [imageUrl] : undefined,
    brand: {
      '@type': 'Brand',
      name: normalizeText(storeName || 'SLStore', 80)
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'ARS',
      price: Number(product?.priceArs || 0),
      availability: 'https://schema.org/InStock',
      url: canonicalUrl || undefined
    }
  };
}

function buildSeoMetaTags({
  storeName,
  publication = {},
  canonicalUrl,
  imageUrl,
  baseUrl,
  modules = {},
  defaults = {}
}) {
  const canonical = toAbsoluteUrl(baseUrl, publication.canonicalUrl || defaults.canonicalUrl || canonicalUrl || '');
  const imageAbsolute = toAbsoluteUrl(baseUrl, imageUrl || publication.imageUrl || '');
  const storeLabel = normalizeText(storeName || 'SLStore', 80);
  const baseTemplateVars = {
    title: normalizeText(publication.title || '', 180),
    description: normalizeText(publication.description || '', 320),
    url: canonical,
    image: imageAbsolute,
    store: storeLabel,
    store_name: storeLabel
  };
  const defaultPageTitle = normalizeText(applyTemplate(defaults.pageTitle, baseTemplateVars), 160);
  const defaultMetaDescription = normalizeText(applyTemplate(defaults.metaDescription, baseTemplateVars), 240);
  const defaultMetaKeywords = normalizeKeywords(applyTemplate(defaults.metaKeywords, baseTemplateVars));

  const title = ensureTitle(
    publication.title || defaultPageTitle || 'SLStore',
    storeName,
    publication.includeStoreInTitle !== false
  );
  const description = normalizeText(publication.description || defaultMetaDescription || 'Tienda deportiva online.', 200);
  const dynamicTitle = normalizeText(publication.title || '', 180) || title;
  const dynamicDescription = normalizeText(publication.description || '', 320) || description;
  const templateVars = {
    ...baseTemplateVars,
    title: dynamicTitle,
    description: dynamicDescription,
    url: canonical,
    image: imageAbsolute
  };
  const publicationKeywords = applyTemplate(publication.keywords || '', templateVars);
  const keywords = normalizeKeywords([publicationKeywords, defaultMetaKeywords].filter(Boolean).join(', '));
  const htmlMetaEnabled = asEnabled(modules.htmlMeta, true);
  const openGraphEnabled = asEnabled(modules.openGraph, true);
  const twitterCardsEnabled = asEnabled(modules.twitterCards, true);
  const advancedTagsEnabled = asEnabled(modules.advancedTags, false);
  const schemaMarkupEnabled = asEnabled(modules.schemaMarkup, true);
  const ogType = normalizeText(publication.ogType || defaults.ogType || 'website', 20).toLowerCase() || 'website';
  const locale = normalizeText(publication.locale || defaults.ogLocale || defaults.contentLanguage || 'es_AR', 16) || 'es_AR';
  const defaultOgSiteName = normalizeText(applyTemplate(defaults.ogSiteName, templateVars), 120);
  const defaultOgTitle = normalizeText(applyTemplate(defaults.ogTitle, templateVars), 140);
  const defaultOgDescription = normalizeText(applyTemplate(defaults.ogDescription, templateVars), 220);
  const defaultOgUrl = applyTemplate(defaults.ogUrl, templateVars);
  const ogSiteName = normalizeText(publication.ogSiteName || defaultOgSiteName || storeName || 'SLStore', 120);
  const ogTitle = normalizeText(publication.ogTitle || defaultOgTitle || title, 140);
  const ogDescription = normalizeText(publication.ogDescription || defaultOgDescription || description, 220);
  const ogUrl = toAbsoluteUrl(baseUrl, publication.ogUrl || defaultOgUrl || canonical || defaults.ogUrl);
  const schemaType = normalizeText(publication.schemaType || defaults.schemaType || 'WebPage', 40) || 'WebPage';
  const robotsIndex = asEnabled(defaults.robotsIndex, true);
  const robotsFollow = asEnabled(defaults.robotsFollow, true);
  const advancedNoArchive = asEnabled(defaults.advancedNoArchive, false);
  const advancedNoSnippet = asEnabled(defaults.advancedNoSnippet, false);
  const advancedNoImageIndex = asEnabled(defaults.advancedNoImageIndex, false);
  const advancedMaxSnippet = normalizeDirectiveNumber(defaults.advancedMaxSnippet, 5000);
  const advancedMaxImagePreview = normalizeAdvancedImagePreview(defaults.advancedMaxImagePreview || 'large');
  const advancedMaxVideoPreview = normalizeDirectiveNumber(defaults.advancedMaxVideoPreview, 86400);
  const advancedUnavailableAfter = normalizeDirectiveText(defaults.advancedUnavailableAfter, 80);
  const advancedGooglebotRules = normalizeDirectiveText(defaults.advancedGooglebotRules, 240);
  const advancedGooglebotNewsRules = normalizeDirectiveText(defaults.advancedGooglebotNewsRules, 240);
  const advancedHreflang = normalizeHreflangEntries(
    Array.isArray(defaults.advancedHreflang) ? defaults.advancedHreflang : [],
    baseUrl
  );
  const advancedRobotsParts = [];
  if (advancedNoArchive) advancedRobotsParts.push('noarchive');
  if (advancedNoSnippet) advancedRobotsParts.push('nosnippet');
  if (advancedNoImageIndex) advancedRobotsParts.push('noimageindex');
  if (advancedMaxSnippet !== '') advancedRobotsParts.push(`max-snippet:${advancedMaxSnippet}`);
  if (advancedMaxImagePreview) advancedRobotsParts.push(`max-image-preview:${advancedMaxImagePreview}`);
  if (advancedMaxVideoPreview !== '') advancedRobotsParts.push(`max-video-preview:${advancedMaxVideoPreview}`);
  if (advancedUnavailableAfter) advancedRobotsParts.push(`unavailable_after:${advancedUnavailableAfter}`);
  const robotsParts = [robotsIndex ? 'index' : 'noindex', robotsFollow ? 'follow' : 'nofollow'];
  if (advancedTagsEnabled) {
    robotsParts.push(...advancedRobotsParts);
  }
  const robotsDirective = robotsParts.join(', ');
  const author = normalizeText(defaults.author || storeName || 'SLStore', 120);
  const contentLanguage = normalizeText(defaults.contentLanguage || '', 16);
  const geoRegion = normalizeText(defaults.geoRegion || '', 24);
  const geoPlaceName = normalizeText(defaults.geoPlaceName || '', 120);
  const geoPosition = normalizeText(defaults.geoPosition || '', 64);
  const publicationOgImages = normalizeOgImageEntries(
    [...(Array.isArray(publication.ogImages) ? publication.ogImages : []), imageAbsolute],
    baseUrl
  );
  const fallbackOgImages = normalizeOgImageEntries(Array.isArray(defaults.ogImages) ? defaults.ogImages : [], baseUrl);
  const ogImages = publicationOgImages.length ? publicationOgImages : fallbackOgImages;
  const primarySocialImage = ogImages[0]?.url || imageAbsolute;
  const socialTemplateVars = {
    ...templateVars,
    image: primarySocialImage || templateVars.image
  };
  const defaultTwitterCardType = applyTemplate(defaults.twitterCardType, socialTemplateVars);
  const defaultTwitterTitle = normalizeText(applyTemplate(defaults.twitterTitle, socialTemplateVars), 70);
  const defaultTwitterDescription = normalizeText(applyTemplate(defaults.twitterDescription, socialTemplateVars), 200);
  const defaultTwitterImage = applyTemplate(defaults.twitterImage, socialTemplateVars);
  const defaultTwitterSite = applyTemplate(defaults.twitterSite, socialTemplateVars);
  const defaultTwitterCreator = applyTemplate(defaults.twitterCreator, socialTemplateVars);
  const twitterCardType = normalizeTwitterCardType(
    publication.twitterCardType || defaultTwitterCardType || (primarySocialImage ? 'summary_large_image' : 'summary')
  );
  const twitterTitle = normalizeText(publication.twitterTitle || defaultTwitterTitle || ogTitle || title, 70);
  const twitterDescription = normalizeText(
    publication.twitterDescription || defaultTwitterDescription || ogDescription || description,
    200
  );
  const twitterImage = toAbsoluteUrl(baseUrl, publication.twitterImage || defaultTwitterImage || primarySocialImage || '');
  const twitterSite = normalizeTwitterHandle(publication.twitterSite || defaultTwitterSite || '');
  const twitterCreator = normalizeTwitterHandle(publication.twitterCreator || defaultTwitterCreator || '');

  const lines = ['<!-- SEO_MODULES -->'];

  if (htmlMetaEnabled) {
    lines.push(`<meta name="description" content="${escapeHtmlAttr(description)}" />`);
    if (keywords) {
      lines.push(`<meta name="keywords" content="${escapeHtmlAttr(keywords)}" />`);
    }
    if (author) {
      lines.push(`<meta name="author" content="${escapeHtmlAttr(author)}" />`);
    }
    if (contentLanguage) {
      lines.push(`<meta http-equiv="content-language" content="${escapeHtmlAttr(contentLanguage)}" />`);
    }
    if (geoRegion) {
      lines.push(`<meta name="geo.region" content="${escapeHtmlAttr(geoRegion)}" />`);
    }
    if (geoPlaceName) {
      lines.push(`<meta name="geo.placename" content="${escapeHtmlAttr(geoPlaceName)}" />`);
    }
    if (geoPosition) {
      lines.push(`<meta name="geo.position" content="${escapeHtmlAttr(geoPosition)}" />`);
      lines.push(`<meta name="ICBM" content="${escapeHtmlAttr(geoPosition)}" />`);
    }
  }

  if (htmlMetaEnabled || advancedTagsEnabled) {
    lines.push(`<meta name="robots" content="${escapeHtmlAttr(robotsDirective)}" />`);
  }

  if (openGraphEnabled) {
    lines.push(`<meta property="og:type" content="${escapeHtmlAttr(ogType)}" />`);
    lines.push(`<meta property="og:site_name" content="${escapeHtmlAttr(ogSiteName)}" />`);
    lines.push(`<meta property="og:title" content="${escapeHtmlAttr(ogTitle)}" />`);
    lines.push(`<meta property="og:description" content="${escapeHtmlAttr(ogDescription)}" />`);
    if (ogUrl) lines.push(`<meta property="og:url" content="${escapeHtmlAttr(ogUrl)}" />`);
    ogImages.forEach((image) => {
      lines.push(`<meta property="og:image" content="${escapeHtmlAttr(image.url)}" />`);
    });
    lines.push(`<meta property="og:locale" content="${escapeHtmlAttr(locale)}" />`);
  }

  if (twitterCardsEnabled) {
    lines.push(`<meta name="twitter:card" content="${escapeHtmlAttr(twitterCardType)}" />`);
    lines.push(`<meta name="twitter:title" content="${escapeHtmlAttr(twitterTitle)}" />`);
    lines.push(`<meta name="twitter:description" content="${escapeHtmlAttr(twitterDescription)}" />`);
    if (twitterImage) lines.push(`<meta name="twitter:image" content="${escapeHtmlAttr(twitterImage)}" />`);
    if (twitterSite) lines.push(`<meta name="twitter:site" content="${escapeHtmlAttr(twitterSite)}" />`);
    if (twitterCreator) lines.push(`<meta name="twitter:creator" content="${escapeHtmlAttr(twitterCreator)}" />`);
  }

  if (advancedTagsEnabled) {
    const googlebotDirective = advancedGooglebotRules || robotsDirective;
    if (googlebotDirective) {
      lines.push(`<meta name="googlebot" content="${escapeHtmlAttr(googlebotDirective)}" />`);
    }
    if (advancedGooglebotNewsRules) {
      lines.push(`<meta name="googlebot-news" content="${escapeHtmlAttr(advancedGooglebotNewsRules)}" />`);
    }
    lines.push('<meta name="theme-color" content="#020617" />');
    lines.push('<meta name="referrer" content="strict-origin-when-cross-origin" />');
    advancedHreflang.forEach((entry) => {
      lines.push(`<link rel="alternate" hreflang="${escapeHtmlAttr(entry.lang)}" href="${escapeHtmlAttr(entry.url)}" />`);
    });
  }

  if (schemaMarkupEnabled) {
    const schemaData =
      publication.schemaData && typeof publication.schemaData === 'object'
        ? publication.schemaData
        : buildDefaultSchemaData({
            schemaType,
            title: dynamicTitle,
            description: dynamicDescription,
            canonicalUrl: canonical,
            imageUrl: imageAbsolute,
            storeName,
            defaults,
            baseUrl
          });
    lines.push(`<script type="application/ld+json">${toSafeJsonLdString(schemaData)}</script>`);
  }

  if (canonical) {
    lines.push(`<link rel="canonical" href="${escapeHtmlAttr(canonical)}" />`);
  }

  lines.push('<!-- /SEO_MODULES -->');
  return lines.filter(Boolean).join('\n    ');
}

function buildProductSocialMetaTags({
  storeName,
  product,
  canonicalUrl,
  imageUrl,
  baseUrl,
  modules = {},
  defaults = {}
}) {
  const schemaData = buildProductSchemaData({
    storeName,
    product,
    canonicalUrl: toAbsoluteUrl(baseUrl, canonicalUrl),
    imageUrl: toAbsoluteUrl(baseUrl, imageUrl)
  });
  return buildSeoMetaTags({
    storeName,
    canonicalUrl,
    imageUrl,
    baseUrl,
    modules,
    defaults,
    publication: {
      title: product?.name || 'Producto',
      description: product?.description || 'Tienda deportiva online.',
      keywords: buildKeywords({ storeName, product }),
      ogType: 'product',
      ogImages: Array.isArray(product?.images)
        ? product.images
            .map((image, index) => ({
              url: image?.sliderUrl || image?.url || '',
              isPrimary: index === 0
            }))
            .filter((image) => Boolean(String(image.url || '').trim()))
        : [],
      schemaType: 'Product',
      includeStoreInTitle: true,
      schemaData
    }
  });
}

function injectSocialMetaIntoHtml(html, tags) {
  const source = String(html || '');
  const marker = '<!-- SEO_META -->';
  if (source.includes(marker)) {
    return source.replace(marker, tags || '');
  }

  const legacyMarker = '<!-- SOCIAL_META -->';
  if (source.includes(legacyMarker)) {
    return source.replace(legacyMarker, tags || '');
  }

  const headClose = '</head>';
  if (source.includes(headClose)) {
    return source.replace(headClose, `${tags || ''}\n  ${headClose}`);
  }
  return source;
}

module.exports = {
  buildSeoMetaTags,
  buildProductSocialMetaTags,
  injectSocialMetaIntoHtml,
  toAbsoluteUrl
};
