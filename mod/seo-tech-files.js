const SEO_TECH_FILES_DEFAULTS = Object.freeze({
  moduleEnabled: 1,
  sitemapGeneratorEnabled: 1,
  sitemapGeneratorNotes:
    'Generar sitemap.xml dinamico con URLs de paginas y productos para mejorar rastreo e indexacion.',
  robotsTxtEnabled: 1,
  robotsTxtContent: ['User-agent: *', 'Allow: /', 'Sitemap: {{sitemapUrl}}'].join('\n'),
  htaccessEnabled: 0,
  htaccessContent: [
    '# SLStore - ejemplo base para Apache',
    '<IfModule mod_rewrite.c>',
    '  RewriteEngine On',
    '</IfModule>',
    '',
    '<IfModule mod_expires.c>',
    '  ExpiresActive On',
    '  ExpiresByType image/webp "access plus 1 year"',
    '  ExpiresByType image/jpeg "access plus 1 year"',
    '  ExpiresByType image/png "access plus 1 year"',
    '  ExpiresByType text/css "access plus 1 month"',
    '  ExpiresByType application/javascript "access plus 1 month"',
    '</IfModule>'
  ].join('\n')
});

function normalizeSeoTechFileText(value, maxLength = 20000) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim()
    .slice(0, maxLength);
}

module.exports = {
  SEO_TECH_FILES_DEFAULTS,
  normalizeSeoTechFileText
};
