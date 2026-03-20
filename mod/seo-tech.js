function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
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
        ? `\n    <image:image>\n      <image:loc>${escapeXml(
            entry.image.startsWith('http') ? entry.image : `${baseUrl}${entry.image}`
          )}</image:loc>\n    </image:image>`
        : '';
      return `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>\n    <changefreq>${escapeXml(entry.changefreq)}</changefreq>\n    <priority>${escapeXml(entry.priority)}</priority>${imageTag}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${body}\n</urlset>`;
}

function buildRobotsTxt({ settings, baseUrl }) {
  const moduleEnabled = Number(settings?.seoTechFilesEnabled ?? 1) === 1;
  const robotsEnabled = Number(settings?.seoRobotsTxtEnabled ?? 1) === 1;
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

  return robotsText.endsWith('\n') ? robotsText : `${robotsText}\n`;
}

function buildHtaccessTxt({ settings, baseUrl }) {
  const moduleEnabled = Number(settings?.seoTechFilesEnabled ?? 1) === 1;
  const htaccessEnabled = Number(settings?.seoHtaccessEnabled ?? 0) === 1;
  if (!moduleEnabled || !htaccessEnabled) {
    return null;
  }

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

  return text.endsWith('\n') ? text : `${text}\n`;
}

module.exports = {
  buildSitemapXml,
  buildRobotsTxt,
  buildHtaccessTxt
};
