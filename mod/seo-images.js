const SEO_IMAGES_DEFAULTS = Object.freeze({
  moduleEnabled: 1,
  fileNamesEnabled: 1,
  fileNames:
    'Usar nombres de archivo descriptivos, separados por guiones. Evitar nombres genericos como IMG00353.JPG.',
  resizeEnabled: 1,
  resize:
    'Redimensionar imagenes antes de subirlas segun el ancho maximo real de la interfaz para mejorar carga y UX.',
  compressionEnabled: 1,
  compression:
    'Comprimir sin perdida perceptible para reducir peso y mejorar tiempos de carga. Priorizar automatizacion.',
  formatEnabled: 1,
  format:
    'Elegir formato segun caso: JPEG fotos, PNG transparencia, WebP para mejor compresion, SVG en iconos/logos.',
  sitemapEnabled: 1,
  sitemap:
    'Mantener sitemap de imagenes actualizado para mejorar descubrimiento e indexacion en Google Imagenes.',
  cdnEnabled: 1,
  cdn:
    'Servir imagenes desde CDN para reducir latencia global y acelerar entrega segun ubicacion del usuario.',
  lazyLoadingEnabled: 1,
  lazyLoading:
    'Aplicar lazy loading en imagenes fuera del viewport. Evitar lazy loading en imagenes criticas del primer pliegue.',
  browserCacheEnabled: 1,
  browserCache:
    'Configurar cache del navegador con politicas de expiracion para assets estaticos e imagenes recurrentes.',
  structuredDataEnabled: 1,
  structuredData:
    'Agregar datos estructurados de imagen (Product, Recipe, Video, etc.) con URLs rastreables e indexables.',
  socialTagsEnabled: 1,
  socialTags:
    'Configurar Open Graph y Twitter Cards con imagen principal optimizada para compartir en redes sociales.',
  auditEnabled: 1,
  audit:
    'Auditar periodicamente imagenes rotas, faltantes de ALT y peso excesivo para mantener SEO tecnico saludable.'
});

function normalizeSeoImagesText(value, maxLength = 6000) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maxLength);
}

module.exports = {
  SEO_IMAGES_DEFAULTS,
  normalizeSeoImagesText
};
