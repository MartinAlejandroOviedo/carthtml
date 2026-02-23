const GOOGLE_2026_DEFAULTS = Object.freeze({
  moduleEnabled: 1,
  agencyName: 'Tempocrea',
  rolloutWindowEnabled: 1,
  rolloutWindow:
    'Se espera un despliegue inicial entre marzo y junio de 2026, con ajustes adicionales en otono.',
  technicalSeoEnabled: 1,
  technicalSeo: [
    'Indexacion',
    'Arquitectura web',
    'Sitemaps',
    'Robots.txt',
    'Enlaces rotos',
    'Codigos 404',
    'Carga del servidor',
    'INP y CLS'
  ].join('\n'),
  coreWebVitalsEnabled: 1,
  coreWebVitals: [
    'Compresion de imagenes sin perdida',
    'Minificacion de CSS y JS',
    'Lazy loading',
    'Optimizacion de cache',
    'Migracion a servidores rapidos',
    'Mejoras de usabilidad mobile'
  ].join('\n'),
  contentQualityEnabled: 1,
  contentQuality: [
    'Contenido 100% original',
    'Intencion de busqueda real',
    'Aportes de experiencia humana',
    'Estructura SEO avanzada',
    'Semantica LSI',
    'Mayor profundidad que la competencia'
  ].join('\n'),
  securityMaintenanceEnabled: 1,
  securityMaintenance: [
    'Actualizacion mensual del CMS',
    'Actualizacion de plugins y temas',
    'Copias de seguridad',
    'Correccion de errores',
    'Monitorizacion 24/7',
    'Prevencion de ciberataques'
  ].join('\n'),
  localAuthorityEnabled: 1,
  localAuthority: [
    'Google Business Profile optimizado',
    'Citaciones locales sin errores',
    'Resenas autenticas',
    'Landings geo-orientadas',
    'Mapas integrados optimizados'
  ].join('\n'),
  userExperienceEnabled: 1,
  userExperience: [
    'Diseno moderno',
    'Navegacion intuitiva',
    'Interfaz minimalista',
    'Flujo persuasivo',
    'Preparada para vender'
  ].join('\n'),
  competitiveAdvantageEnabled: 1,
  competitiveAdvantage: [
    'Mas de 10 anos de experiencia',
    'Procesos orientados a Google 2026',
    'Estrategias personalizadas',
    'Acompanamiento continuo',
    'Contenido original garantizado'
  ].join('\n')
});

function normalizeGoogle2026Text(value, maxLength = 6000) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maxLength);
}

module.exports = {
  GOOGLE_2026_DEFAULTS,
  normalizeGoogle2026Text
};
