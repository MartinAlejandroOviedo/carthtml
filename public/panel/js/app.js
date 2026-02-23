const TOKEN_KEY = 'panel_token';
const API_BASE = '/api/panel';

const viewConfig = {
  products: {
    title: 'Productos',
    endpoint: 'products',
    idKey: 'id',
    columns: ['id', 'name', 'category', 'priceArs', 'description', 'imageUrl'],
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true, colSpan: 2 },
      { key: 'category', label: 'Categoria', type: 'select', required: true },
      { key: 'priceArs', label: 'Precio ARS', type: 'number', required: true },
      { key: 'imageUrl', label: 'URL Imagen', type: 'hidden', required: false },
      { key: 'description', label: 'Descripcion', type: 'textarea', required: true, colSpan: 2 }
    ]
  },
  categories: {
    title: 'Categorias',
    endpoint: 'categories',
    idKey: 'id',
    columns: ['id', 'name', 'slug'],
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true },
      { key: 'slug', label: 'Slug', type: 'text', required: false }
    ]
  },
  'product-images': {
    title: 'Imagenes de producto',
    endpoint: 'product-images',
    idKey: 'id',
    columns: ['id', 'productId', 'url', 'altText', 'sortOrder'],
    fields: [
      { key: 'productId', label: 'ID Producto', type: 'number', required: true },
      { key: 'url', label: 'URL', type: 'text', required: true },
      { key: 'imageFile', label: 'Archivo imagen', type: 'file', required: false, colSpan: 2 },
      { key: 'imageFiles', label: 'Archivos (multiple)', type: 'file-multiple', required: false, colSpan: 2 },
      { key: 'altText', label: 'Texto ALT', type: 'text', required: false },
      { key: 'sortOrder', label: 'Orden', type: 'number', required: false }
    ]
  },
  pages: {
    title: 'Paginas',
    endpoint: 'pages',
    idKey: 'id',
    columns: ['id', 'slug', 'title', 'updatedAt'],
    fields: [
      { key: 'slug', label: 'Slug', type: 'text', required: true },
      { key: 'title', label: 'Titulo', type: 'text', required: true },
      { key: 'contentHtml', label: 'Contenido HTML', type: 'textarea', required: true, colSpan: 2 }
    ]
  },
  settings: {
    title: 'Configuracion',
    endpoint: 'settings',
    idKey: 'id',
    singleton: true,
    tabs: [
      { id: 'general', label: 'General' },
      { id: 'html-meta', label: 'HTML Meta Tags' },
      { id: 'open-graph', label: 'Open Graph' },
      { id: 'twitter-cards', label: 'Twitter Cards' },
      { id: 'advanced-tags', label: 'Advanced Tags' },
      { id: 'schema-markup', label: 'Schema Markup' },
      { id: 'google-2026', label: 'Google 2026' },
      { id: 'seo-images', label: 'SEO Imagenes' },
      { id: 'tech-files', label: 'Sitemap / Robots' }
    ],
    columns: ['id', 'storeName', 'whatsappNumber', 'updatedAt'],
    fields: [
      {
        key: 'seoGeneralIntro',
        label: 'Configuracion general del sitio',
        description: 'Estos ajustes SEO son globales y aplican a todas las publicaciones del sitio.',
        type: 'section',
        colSpan: 2,
        tab: 'general'
      },
      { key: 'storeName', label: 'Nombre de tienda', type: 'text', required: true, colSpan: 2, tab: 'general' },
      {
        key: 'whatsappNumber',
        label: 'Numero WhatsApp',
        type: 'text',
        required: true,
        colSpan: 2,
        tab: 'general',
        placeholder: '5491112345678'
      },
      {
        key: 'seoModules',
        label: 'Modulos SEO',
        description: 'Activa o desactiva modulos SEO globales. Esta configuracion aplica a todo el sitio.',
        type: 'section',
        colSpan: 2,
        tab: 'general'
      },
      {
        key: 'seoHtmlMetaEnabled',
        label: 'HTML Meta Tags',
        helper: 'Meta description y keywords',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'general'
      },
      {
        key: 'seoOpenGraphEnabled',
        label: 'Open Graph',
        helper: 'Etiquetas para Facebook/LinkedIn',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'general'
      },
      {
        key: 'seoTwitterCardsEnabled',
        label: 'Twitter Cards',
        helper: 'Tarjetas para X/Twitter',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'general'
      },
      {
        key: 'seoAdvancedTagsEnabled',
        label: 'Advanced Tags',
        helper: 'robots, googlebot, author, theme-color',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'general'
      },
      {
        key: 'seoSchemaMarkupEnabled',
        label: 'Schema Markup',
        helper: 'JSON-LD estructurado',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'general'
      },
      {
        key: 'seoGoogle2026Enabled',
        label: 'Google 2026',
        helper: 'Plan de preparacion para la actualizacion de algoritmo 2026',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'general'
      },
      {
        key: 'seoImagesModuleEnabled',
        label: 'SEO de Imagenes',
        helper: 'Checklist y politicas globales de optimizacion de imagenes',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'general'
      },
      {
        key: 'seoTechFilesEnabled',
        label: 'Sitemap, robots.txt y htaccess',
        helper: 'Modulo tecnico para archivos de rastreo e infraestructura',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'general'
      },
      {
        key: 'seoHtmlMetaIntro',
        label: 'AI Suggestions',
        description: 'Completa esta base global para HTML Meta Tags. Luego podemos agregar nuevas pestañas para Open Graph, Twitter, Schema y Advanced.',
        type: 'section',
        colSpan: 2,
        tab: 'html-meta'
      },
      {
        key: 'seoHtmlDefaultTitle',
        label: 'Page Title *',
        type: 'text',
        required: false,
        colSpan: 2,
        tab: 'html-meta',
        placeholder: 'Enter your page title',
        recommendedMin: 50,
        recommendedMax: 60
      },
      {
        key: 'seoHtmlDefaultDescription',
        label: 'Meta Description *',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'html-meta',
        placeholder: 'Enter a compelling description of your page',
        recommendedMin: 150,
        recommendedMax: 160
      },
      {
        key: 'seoHtmlDefaultKeywords',
        label: 'Meta Keywords (Deprecated - legacy support)',
        type: 'text',
        required: false,
        colSpan: 2,
        tab: 'html-meta',
        placeholder: 'keyword1, keyword2, keyword3',
        helperText: 'Note: Most search engines no longer use meta keywords for ranking.'
      },
      {
        key: 'seoHtmlAuthor',
        label: 'Author',
        type: 'text',
        required: false,
        tab: 'html-meta',
        placeholder: 'John Doe'
      },
      {
        key: 'seoHtmlContentLanguage',
        label: 'Content Language',
        type: 'text',
        required: false,
        tab: 'html-meta',
        placeholder: 'e.g., en, es, fr, de',
        helperText: "Use ISO 639-1 language codes (2-letter codes like 'en', 'es', 'fr')."
      },
      {
        key: 'seoHtmlRobotsIndexEnabled',
        label: 'Allow search engines to index this page',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'html-meta'
      },
      {
        key: 'seoHtmlRobotsFollowEnabled',
        label: 'Allow search engines to follow links',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'html-meta'
      },
      {
        key: 'seoGeoSection',
        label: 'Geographic Targeting',
        description: 'Opcional. Utiliza region/city/position en formato ISO y coordenadas.',
        type: 'section',
        colSpan: 2,
        tab: 'html-meta'
      },
      {
        key: 'seoHtmlGeoRegion',
        label: 'Region (ISO 3166-1)',
        type: 'text',
        required: false,
        tab: 'html-meta',
        placeholder: 'e.g., US-CA, AR-B',
        helperText: "Country code or country-region (e.g., 'US', 'US-CA' for California)."
      },
      {
        key: 'seoHtmlGeoPlaceName',
        label: 'Place Name',
        type: 'text',
        required: false,
        tab: 'html-meta',
        placeholder: 'e.g., San Francisco, Buenos Aires',
        helperText: 'City or location name.'
      },
      {
        key: 'seoHtmlGeoPosition',
        label: 'Position (Latitude, Longitude)',
        type: 'text',
        required: false,
        colSpan: 2,
        tab: 'html-meta',
        placeholder: 'e.g., -34.6037, -58.3816',
        helperText: 'Coordinates in format: latitude, longitude.'
      },
      {
        key: 'seoOpenGraphIntro',
        label: 'Open Graph',
        description:
          'Configuracion global de Open Graph para compartir en Facebook, LinkedIn, WhatsApp y Slack. Soporta placeholders: {{title}}, {{description}}, {{url}}, {{image}}, {{store}}.',
        type: 'section',
        colSpan: 2,
        tab: 'open-graph'
      },
      {
        key: 'seoOgDefaultTitle',
        label: 'OG Title *',
        type: 'text',
        required: false,
        colSpan: 2,
        tab: 'open-graph',
        placeholder: 'Enter title for social sharing',
        recommendedMin: 50,
        recommendedMax: 60
      },
      {
        key: 'seoOgDefaultDescription',
        label: 'OG Description *',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'open-graph',
        placeholder: 'Enter description for social sharing',
        recommendedMin: 100,
        recommendedMax: 200
      },
      {
        key: 'seoOgImagesJson',
        label: 'OG Images *',
        type: 'og-images',
        required: false,
        colSpan: 2,
        tab: 'open-graph'
      },
      {
        key: 'seoOgUrl',
        label: 'OG URL',
        type: 'text',
        required: false,
        colSpan: 2,
        tab: 'open-graph',
        placeholder: 'https://example.com/page'
      },
      {
        key: 'seoOgType',
        label: 'OG Type',
        type: 'select',
        required: false,
        tab: 'open-graph',
        options: [
          { value: 'website', label: 'Website' },
          { value: 'article', label: 'Article' },
          { value: 'product', label: 'Product' },
          { value: 'profile', label: 'Profile' }
        ]
      },
      {
        key: 'seoOgSiteName',
        label: 'Site Name',
        type: 'text',
        required: false,
        tab: 'open-graph',
        placeholder: 'Your Site Name'
      },
      {
        key: 'seoOgLocale',
        label: 'Locale',
        type: 'text',
        required: false,
        tab: 'open-graph',
        placeholder: 'e.g., en_US, es_ES',
        helperText: "Format: language_TERRITORY (e.g., en_US for English-United States)."
      },
      {
        key: 'seoTwitterIntro',
        label: 'Twitter Cards',
        description:
          'Configuracion global para tarjetas de X/Twitter con imagen y datos de cuenta. Soporta placeholders: {{title}}, {{description}}, {{url}}, {{image}}, {{store}}.',
        type: 'section',
        colSpan: 2,
        tab: 'twitter-cards'
      },
      {
        key: 'seoTwitterCardType',
        label: 'Card Type',
        type: 'select',
        required: false,
        tab: 'twitter-cards',
        options: [
          { value: 'summary_large_image', label: 'Summary Large Image (1200x628 hero)' },
          { value: 'summary', label: 'Summary' },
          { value: 'app', label: 'App' },
          { value: 'player', label: 'Player' }
        ]
      },
      {
        key: 'seoTwitterTitle',
        label: 'Twitter Title *',
        type: 'text',
        required: false,
        colSpan: 2,
        tab: 'twitter-cards',
        placeholder: 'Enter title for Twitter',
        recommendedMax: 70
      },
      {
        key: 'seoTwitterDescription',
        label: 'Twitter Description *',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'twitter-cards',
        placeholder: 'Enter description for Twitter',
        recommendedMax: 200
      },
      {
        key: 'seoTwitterImageUrl',
        label: 'Twitter Image *',
        type: 'twitter-image',
        required: false,
        colSpan: 2,
        tab: 'twitter-cards'
      },
      {
        key: 'seoTwitterSiteHandle',
        label: 'Twitter Site Handle',
        type: 'text',
        required: false,
        tab: 'twitter-cards',
        placeholder: '@yourhandle'
      },
      {
        key: 'seoTwitterCreatorHandle',
        label: 'Twitter Creator Handle',
        type: 'text',
        required: false,
        tab: 'twitter-cards',
        placeholder: '@creator'
      },
      {
        key: 'seoAdvancedIntro',
        label: 'Advanced Tags',
        description: 'Directivas avanzadas para robots, googlebot y multi-idioma (hreflang).',
        type: 'section',
        colSpan: 2,
        tab: 'advanced-tags'
      },
      {
        key: 'seoAdvancedCanonicalUrl',
        label: 'Canonical URL',
        type: 'text',
        required: false,
        colSpan: 2,
        tab: 'advanced-tags',
        placeholder: 'https://example.com/canonical-page',
        helperText: 'Preferred URL to avoid duplicate content issues.'
      },
      {
        key: 'seoAdvancedNoArchiveEnabled',
        label: 'No Archive',
        helper: 'Prevent cached copies',
        type: 'switch',
        required: false,
        tab: 'advanced-tags'
      },
      {
        key: 'seoAdvancedNoSnippetEnabled',
        label: 'No Snippet',
        helper: "Don't show text snippet",
        type: 'switch',
        required: false,
        tab: 'advanced-tags'
      },
      {
        key: 'seoAdvancedNoImageIndexEnabled',
        label: 'No Image Index',
        helper: "Don't index images",
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'advanced-tags'
      },
      {
        key: 'seoAdvancedMaxSnippet',
        label: 'Max Snippet Length',
        type: 'number',
        required: false,
        tab: 'advanced-tags',
        placeholder: '160',
        helperText: '-1 no limit, 0 no snippet, or max characters.'
      },
      {
        key: 'seoAdvancedMaxImagePreview',
        label: 'Max Image Preview Size',
        type: 'select',
        required: false,
        tab: 'advanced-tags',
        options: [
          { value: 'large', label: 'Large' },
          { value: 'standard', label: 'Standard' },
          { value: 'none', label: 'None' }
        ]
      },
      {
        key: 'seoAdvancedMaxVideoPreview',
        label: 'Max Video Preview Duration',
        type: 'number',
        required: false,
        tab: 'advanced-tags',
        placeholder: '-1',
        helperText: '-1 no limit, 0 no preview, or max seconds.'
      },
      {
        key: 'seoAdvancedUnavailableAfter',
        label: 'Unavailable After Date',
        type: 'text',
        required: false,
        colSpan: 2,
        tab: 'advanced-tags',
        placeholder: 'dd/mm/aaaa, --:--',
        helperText: "Search engines won't show this page after this date."
      },
      {
        key: 'seoAdvancedGooglebotRules',
        label: 'Googlebot Specific Rules',
        type: 'text',
        required: false,
        colSpan: 2,
        tab: 'advanced-tags',
        placeholder: 'noindex, nofollow'
      },
      {
        key: 'seoAdvancedGooglebotNewsRules',
        label: 'Googlebot-News Rules',
        type: 'text',
        required: false,
        colSpan: 2,
        tab: 'advanced-tags',
        placeholder: 'nosnippet'
      },
      {
        key: 'seoAdvancedHreflangJson',
        label: 'Hreflang Tags',
        type: 'hreflang-list',
        required: false,
        colSpan: 2,
        tab: 'advanced-tags'
      },
      {
        key: 'seoSchemaIntro',
        label: 'Schema Markup',
        description:
          'Schema ayuda a los buscadores a entender mejor el contenido y habilita rich snippets en resultados. Campos de texto soportan placeholders: {{title}}, {{description}}, {{url}}, {{image}}, {{store}}.',
        type: 'section',
        colSpan: 2,
        tab: 'schema-markup'
      },
      {
        key: 'seoSchemaType',
        label: 'Schema Type',
        type: 'select',
        required: false,
        tab: 'schema-markup',
        options: [
          { value: 'Article', label: 'Article' },
          { value: 'WebPage', label: 'WebPage' },
          { value: 'WebSite', label: 'WebSite' },
          { value: 'Product', label: 'Product' },
          { value: 'Organization', label: 'Organization' },
          { value: 'LocalBusiness', label: 'LocalBusiness' },
          { value: 'Event', label: 'Event' },
          { value: 'FAQPage', label: 'FAQPage' }
        ]
      },
      {
        key: 'seoSchemaName',
        label: 'Name / Title *',
        type: 'text',
        required: false,
        colSpan: 2,
        tab: 'schema-markup',
        placeholder: 'Enter name or title'
      },
      {
        key: 'seoSchemaDescription',
        label: 'Description *',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'schema-markup',
        placeholder: 'Enter description'
      },
      {
        key: 'seoSchemaImageUrl',
        label: 'Image URL',
        type: 'text',
        required: false,
        colSpan: 2,
        tab: 'schema-markup',
        placeholder: 'https://example.com/image.jpg'
      },
      {
        key: 'seoSchemaUrl',
        label: 'URL',
        type: 'text',
        required: false,
        colSpan: 2,
        tab: 'schema-markup',
        placeholder: 'https://example.com/page'
      },
      {
        key: 'seoSchemaAuthor',
        label: 'Author',
        type: 'text',
        required: false,
        tab: 'schema-markup',
        placeholder: 'John Doe'
      },
      {
        key: 'seoSchemaDatePublished',
        label: 'Date Published',
        type: 'date',
        required: false,
        tab: 'schema-markup'
      },
      {
        key: 'seoSchemaHeadline',
        label: 'Headline',
        type: 'text',
        required: false,
        colSpan: 2,
        tab: 'schema-markup',
        placeholder: 'Article headline'
      },
      {
        key: 'seoGoogle2026Intro',
        label: 'Google Algorithm 2026',
        description:
          'Plan global de preparacion para la actualizacion de Google 2026. Se aplica a todo el sitio y sirve como checklist operativo.',
        type: 'section',
        colSpan: 2,
        tab: 'google-2026'
      },
      {
        key: 'seoGoogle2026AgencyName',
        label: 'Metodo / Agencia',
        type: 'text',
        required: false,
        colSpan: 2,
        tab: 'google-2026',
        placeholder: 'Tempocrea'
      },
      {
        key: 'seoGoogle2026RolloutWindow',
        label: 'Ventana estimada de rollout',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'google-2026',
        placeholder: 'Primeras fases entre marzo-junio 2026, con ajustes en otono.'
      },
      {
        key: 'seoGoogle2026RolloutWindowEnabled',
        label: 'Activar ventana de rollout',
        helper: 'Mostrar/usar este punto en la estrategia',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'google-2026'
      },
      {
        key: 'seoGoogle2026TechnicalSeo',
        label: '1. SEO tecnico',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'google-2026',
        placeholder: 'Indexacion, arquitectura, sitemap, robots, 404, INP, CLS...'
      },
      {
        key: 'seoGoogle2026TechnicalSeoEnabled',
        label: 'Activar SEO tecnico',
        helper: 'Mostrar/usar este punto en la estrategia',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'google-2026'
      },
      {
        key: 'seoGoogle2026CoreWebVitals',
        label: '2. Velocidad y Core Web Vitals',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'google-2026',
        placeholder: 'Compresion de imagenes, minificacion, lazy loading, cache...'
      },
      {
        key: 'seoGoogle2026CoreWebVitalsEnabled',
        label: 'Activar Core Web Vitals',
        helper: 'Mostrar/usar este punto en la estrategia',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'google-2026'
      },
      {
        key: 'seoGoogle2026ContentQuality',
        label: '3. Contenido profundo y original',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'google-2026',
        placeholder: 'Contenido original, experiencia real, semantica LSI...'
      },
      {
        key: 'seoGoogle2026ContentQualityEnabled',
        label: 'Activar contenido',
        helper: 'Mostrar/usar este punto en la estrategia',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'google-2026'
      },
      {
        key: 'seoGoogle2026SecurityMaintenance',
        label: '4. Seguridad y mantenimiento',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'google-2026',
        placeholder: 'Updates de CMS/plugins, backups, monitoreo 24/7...'
      },
      {
        key: 'seoGoogle2026SecurityMaintenanceEnabled',
        label: 'Activar seguridad y mantenimiento',
        helper: 'Mostrar/usar este punto en la estrategia',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'google-2026'
      },
      {
        key: 'seoGoogle2026LocalAuthority',
        label: '5. Autoridad local',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'google-2026',
        placeholder: 'Google Business Profile, citaciones, resenas, landings geo...'
      },
      {
        key: 'seoGoogle2026LocalAuthorityEnabled',
        label: 'Activar autoridad local',
        helper: 'Mostrar/usar este punto en la estrategia',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'google-2026'
      },
      {
        key: 'seoGoogle2026UserExperience',
        label: '6. Experiencia de usuario',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'google-2026',
        placeholder: 'Diseno moderno, intuitivo, minimalista y orientado a conversion.'
      },
      {
        key: 'seoGoogle2026UserExperienceEnabled',
        label: 'Activar experiencia de usuario',
        helper: 'Mostrar/usar este punto en la estrategia',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'google-2026'
      },
      {
        key: 'seoGoogle2026CompetitiveAdvantage',
        label: 'Ventaja competitiva',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'google-2026',
        placeholder: 'Puntos diferenciales para adelantarse al update.'
      },
      {
        key: 'seoGoogle2026CompetitiveAdvantageEnabled',
        label: 'Activar ventaja competitiva',
        helper: 'Mostrar/usar este punto en la estrategia',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'google-2026'
      },
      {
        key: 'seoImagesIntro',
        label: 'SEO de Imagenes',
        description:
          'Configuracion global para optimizar imagenes con foco en rendimiento, indexacion y visibilidad en Google Imagenes.',
        type: 'section',
        colSpan: 2,
        tab: 'seo-images'
      },
      {
        key: 'seoImagesFileNames',
        label: '1. Nombres de archivo descriptivos',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'seo-images',
        placeholder: 'Ej: blanco-air-force-1-rayas-pastel.jpg (usar guiones, no guiones bajos)'
      },
      {
        key: 'seoImagesFileNamesEnabled',
        label: 'Activar punto 1',
        helper: 'Aplicar/mostrar esta politica',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'seo-images'
      },
      {
        key: 'seoImagesResize',
        label: '2. Redimensionado segun pantalla',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'seo-images',
        placeholder: 'Subir imagenes ajustadas al tamano real de render para evitar peso innecesario.'
      },
      {
        key: 'seoImagesResizeEnabled',
        label: 'Activar punto 2',
        helper: 'Aplicar/mostrar esta politica',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'seo-images'
      },
      {
        key: 'seoImagesCompression',
        label: '3. Compresion de imagenes',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'seo-images',
        placeholder: 'Comprimir sin perdida perceptible para acelerar carga.'
      },
      {
        key: 'seoImagesCompressionEnabled',
        label: 'Activar punto 3',
        helper: 'Aplicar/mostrar esta politica',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'seo-images'
      },
      {
        key: 'seoImagesFormat',
        label: '4. Formato correcto',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'seo-images',
        placeholder: 'JPEG fotos, PNG transparencia, WebP compresion moderna, SVG iconos/logos.'
      },
      {
        key: 'seoImagesFormatEnabled',
        label: 'Activar punto 4',
        helper: 'Aplicar/mostrar esta politica',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'seo-images'
      },
      {
        key: 'seoImagesSitemap',
        label: '5. Sitemap de imagenes',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'seo-images',
        placeholder: 'Incluir URLs de imagenes para mejorar descubrimiento en Google Imagenes.'
      },
      {
        key: 'seoImagesSitemapEnabled',
        label: 'Activar punto 5',
        helper: 'Aplicar/mostrar esta politica',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'seo-images'
      },
      {
        key: 'seoImagesCdn',
        label: '6. CDN para imagenes',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'seo-images',
        placeholder: 'Distribuir contenido desde nodos cercanos para menor latencia.'
      },
      {
        key: 'seoImagesCdnEnabled',
        label: 'Activar punto 6',
        helper: 'Aplicar/mostrar esta politica',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'seo-images'
      },
      {
        key: 'seoImagesLazyLoading',
        label: '7. Lazy loading',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'seo-images',
        placeholder: 'Cargar diferido fuera del viewport; evitar en imagenes above-the-fold.'
      },
      {
        key: 'seoImagesLazyLoadingEnabled',
        label: 'Activar punto 7',
        helper: 'Aplicar/mostrar esta politica',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'seo-images'
      },
      {
        key: 'seoImagesBrowserCache',
        label: '8. Cache del navegador',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'seo-images',
        placeholder: 'Definir expiracion y cache-control para acelerar visitas recurrentes.'
      },
      {
        key: 'seoImagesBrowserCacheEnabled',
        label: 'Activar punto 8',
        helper: 'Aplicar/mostrar esta politica',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'seo-images'
      },
      {
        key: 'seoImagesStructuredData',
        label: '9. Datos estructurados de imagen',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'seo-images',
        placeholder: 'Usar schema (Product/Recipe/Video) con imagen relevante e indexable.'
      },
      {
        key: 'seoImagesStructuredDataEnabled',
        label: 'Activar punto 9',
        helper: 'Aplicar/mostrar esta politica',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'seo-images'
      },
      {
        key: 'seoImagesSocialTags',
        label: '10. Open Graph y Twitter Cards',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'seo-images',
        placeholder: 'Definir imagen principal social en OG/Twitter para shares consistentes.'
      },
      {
        key: 'seoImagesSocialTagsEnabled',
        label: 'Activar punto 10',
        helper: 'Aplicar/mostrar esta politica',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'seo-images'
      },
      {
        key: 'seoImagesAudit',
        label: 'Auditoria de imagenes',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'seo-images',
        placeholder: 'Controlar imagenes rotas, sin ALT y otros errores de SEO tecnico.'
      },
      {
        key: 'seoImagesAuditEnabled',
        label: 'Activar auditoria',
        helper: 'Aplicar/mostrar esta politica',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'seo-images'
      },
      {
        key: 'seoTechFilesIntro',
        label: 'Sitemap Generator, robots.txt y htaccess',
        description:
          'Configura estos archivos tecnicos desde el panel. Sitemap y robots se publican automaticamente por ruta.',
        type: 'section',
        colSpan: 2,
        tab: 'tech-files'
      },
      {
        key: 'seoSitemapGeneratorNotes',
        label: 'Sitemap Generator',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'tech-files',
        placeholder: 'Politica del sitemap: que URLs incluir, frecuencia, prioridades.'
      },
      {
        key: 'seoSitemapGeneratorEnabled',
        label: 'Activar sitemap generator',
        helper: 'Publica /sitemap.xml dinamico',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'tech-files'
      },
      {
        key: 'seoRobotsTxtContent',
        label: 'robots.txt',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'tech-files',
        placeholder: 'User-agent: *\\nAllow: /\\nSitemap: {{sitemapUrl}}'
      },
      {
        key: 'seoRobotsTxtEnabled',
        label: 'Activar robots.txt',
        helper: 'Publica /robots.txt',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'tech-files'
      },
      {
        key: 'seoHtaccessContent',
        label: 'htaccess',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'tech-files',
        placeholder: 'Reglas Apache base para cache, compresion y rewrite.'
      },
      {
        key: 'seoHtaccessEnabled',
        label: 'Activar htaccess',
        helper: 'Publica /htaccess.txt para copia/descarga',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'tech-files'
      }
    ]
  },
  users: {
    title: 'Usuarios',
    endpoint: 'users',
    idKey: 'id',
    columns: ['id', 'username', 'fullName', 'role', 'isActive', 'createdAt'],
    fields: [
      { key: 'username', label: 'Usuario', type: 'text', required: true },
      { key: 'password', label: 'Clave', type: 'password', required: true },
      { key: 'fullName', label: 'Nombre completo', type: 'text', required: true },
      { key: 'role', label: 'Rol', type: 'text', required: true },
      { key: 'isActive', label: 'Activo (1/0)', type: 'number', required: true }
    ]
  }
};

let activeView = 'products';
let editingId = null;
let productUploadFiles = [];
let productPrimaryIndex = 0;
let activeFormTab = null;
let ogImagesState = [];
let twitterImageState = '';
let hreflangState = [];
let settingsInlineMode = false;

const topbarRoot = document.getElementById('panel-topbar');
const navRoot = document.getElementById('panel-nav');
const panelMain = document.getElementById('panel-main');
const crudSection = document.getElementById('crud-section');
const viewTitle = document.getElementById('view-title');
const formEl = document.getElementById('crud-form');
const headEl = document.getElementById('crud-head');
const bodyEl = document.getElementById('crud-body');
const saveBtn = document.getElementById('save-item');
const clearBtn = document.getElementById('clear-form');
const refreshBtn = document.getElementById('refresh-view');
const newBtn = document.getElementById('new-item');
const messageEl = document.getElementById('panel-message');
const formOffcanvas = document.getElementById('form-offcanvas');
const formBackdrop = document.getElementById('form-backdrop');
const closeFormBtn = document.getElementById('close-form');
const formTitle = document.getElementById('form-title');
const defaultFormParent = formOffcanvas.parentElement;

function getInitialPanelView() {
  const view = new URLSearchParams(window.location.search).get('view');
  if (view && viewConfig[view]) return view;
  return 'products';
}

async function loadPart(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`No se pudo cargar ${path}`);
  return res.text();
}

function showMessage(message, isError = false) {
  messageEl.textContent = message;
  messageEl.className = `mt-3 text-sm ${isError ? 'text-rose-300' : 'text-emerald-300'}`;
}

function getConfig() {
  return viewConfig[activeView];
}

function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getFieldValue(field, input) {
  if (!input) return '';
  if (field.type === 'switch') return input.checked ? 1 : 0;
  return input ? input.value : '';
}

function setFieldValue(field, input, value) {
  if (!input) return;
  if (field.type === 'switch') {
    input.checked = Number(value) === 1 || value === true || value === '1';
    return;
  }
  input.value = value ?? '';
}

function updateLengthHint(input) {
  if (!input) return;
  const targetId = input.dataset.lengthTarget;
  if (!targetId) return;
  const target = document.getElementById(targetId);
  if (!target) return;

  const min = Number(input.dataset.lengthMin || 0);
  const max = Number(input.dataset.lengthMax || 0);
  const value = String(input.value || '');
  const length = value.length;

  let status = 'ok';
  let color = 'text-emerald-300';

  if (!length) {
    status = 'muy corto';
    color = 'text-rose-300';
  } else if (min && length < min) {
    status = 'corto';
    color = 'text-amber-300';
  } else if (max && length > max) {
    status = 'largo';
    color = 'text-amber-300';
  }

  const counter = max > 0 ? `${length}/${max}` : `${length}`;
  target.className = `mt-1 text-xs ${color}`;
  target.textContent = `${counter} caracteres (${status})`;
}

function setupLengthHints() {
  formEl.querySelectorAll('[data-length-target]').forEach((input) => {
    const refresh = () => updateLengthHint(input);
    input.addEventListener('input', refresh);
    refresh();
  });
}

function setupFormTabs(cfg) {
  if (!cfg.tabs || !cfg.tabs.length) return;

  const tabsRoot = document.getElementById('form-tabs');
  if (!tabsRoot) return;

  const tabButtons = Array.from(tabsRoot.querySelectorAll('[data-form-tab]'));
  const tabPanels = Array.from(formEl.querySelectorAll('[data-field-tab]'));
  if (!tabButtons.length || !tabPanels.length) return;

  const validTabs = new Set(cfg.tabs.map((tab) => tab.id));
  const defaultTab = validTabs.has(activeFormTab) ? activeFormTab : cfg.tabs[0].id;

  const activateTab = (tabId) => {
    if (!validTabs.has(tabId)) return;
    activeFormTab = tabId;

    tabButtons.forEach((button) => {
      const isActive = button.dataset.formTab === tabId;
      button.classList.toggle('bg-sky-500/25', isActive);
      button.classList.toggle('border-sky-300/60', isActive);
      button.classList.toggle('text-white', isActive);
      button.classList.toggle('text-slate-300', !isActive);
    });

    tabPanels.forEach((panel) => {
      const isVisible = panel.dataset.fieldTab === tabId;
      panel.classList.toggle('hidden', !isVisible);
    });
  };

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => activateTab(button.dataset.formTab));
  });

  activateTab(defaultTab);
}

function normalizeOgImageEntry(item) {
  if (typeof item === 'string') {
    const url = item.trim();
    if (!url) return null;
    return { url, isPrimary: false };
  }

  if (!item || typeof item !== 'object') return null;
  const url = String(item.url || '').trim();
  if (!url) return null;
  return {
    url,
    isPrimary: Boolean(item.isPrimary)
  };
}

function parseOgImagesValue(value) {
  if (!value) return [];

  let parsed = [];
  if (Array.isArray(value)) {
    parsed = value;
  } else if (typeof value === 'string') {
    const raw = value.trim();
    if (!raw) return [];
    try {
      const maybe = JSON.parse(raw);
      parsed = Array.isArray(maybe) ? maybe : [];
    } catch (_error) {
      parsed = raw
        .split(/\r?\n|,/)
        .map((entry) => entry.trim())
        .filter(Boolean);
    }
  }

  const normalized = [];
  const seen = new Set();
  parsed.forEach((item) => {
    const entry = normalizeOgImageEntry(item);
    if (!entry || seen.has(entry.url)) return;
    seen.add(entry.url);
    normalized.push(entry);
  });

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

function syncOgImagesInput() {
  const hiddenInput = formEl.elements.namedItem('seoOgImagesJson');
  if (!hiddenInput) return;
  hiddenInput.value = JSON.stringify(ogImagesState);
}

function renderOgImagesList() {
  const listEl = document.getElementById('og-images-list');
  if (!listEl) return;

  if (!ogImagesState.length) {
    listEl.innerHTML = '<p class="text-xs text-slate-400">Sin imagenes configuradas.</p>';
    syncOgImagesInput();
    return;
  }

  listEl.innerHTML = ogImagesState
    .map((item, index) => {
      const checked = item.isPrimary ? 'checked' : '';
      return `
        <div class="rounded-lg border border-white/10 bg-slate-900/50 p-2">
          <div class="flex items-center gap-2">
            <input type="radio" name="og-primary-image" value="${index}" ${checked} />
            <span class="text-xs text-slate-300">Primary Image</span>
            <button
              type="button"
              class="ml-auto rounded border border-rose-400/40 px-2 py-1 text-[11px] text-rose-300"
              data-og-remove="${index}"
            >
              Borrar
            </button>
          </div>
          <p class="mt-1 truncate text-[11px] text-slate-400">${item.url}</p>
        </div>
      `;
    })
    .join('');

  listEl.querySelectorAll('input[name="og-primary-image"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const selectedIndex = Number(radio.value);
      if (!Number.isInteger(selectedIndex)) return;
      ogImagesState = ogImagesState.map((entry, index) => ({
        ...entry,
        isPrimary: index === selectedIndex
      }));
      renderOgImagesList();
    });
  });

  listEl.querySelectorAll('[data-og-remove]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const removeIndex = Number(btn.dataset.ogRemove);
      if (!Number.isInteger(removeIndex)) return;
      ogImagesState = ogImagesState.filter((_entry, index) => index !== removeIndex);
      if (ogImagesState.length && !ogImagesState.some((entry) => entry.isPrimary)) {
        ogImagesState[0].isPrimary = true;
      }
      renderOgImagesList();
    });
  });

  syncOgImagesInput();
}

function addOgImageUrl(url, makePrimary = false) {
  const normalized = String(url || '').trim();
  if (!normalized) return false;
  const exists = ogImagesState.some((entry) => entry.url === normalized);
  if (exists) return false;

  const next = [...ogImagesState, { url: normalized, isPrimary: false }];
  if (makePrimary || !next.some((entry) => entry.isPrimary)) {
    next.forEach((entry, index) => {
      entry.isPrimary = index === next.length - 1;
    });
  }
  ogImagesState = next;
  renderOgImagesList();
  return true;
}

async function uploadSeoImage(file, entityId = 'open-graph') {
  const token = getAuthToken();
  if (!token) {
    window.location.replace('/panel/login.html');
    return '';
  }

  const safeEntityId = String(entityId || 'open-graph').trim() || 'open-graph';
  const data = new FormData();
  data.append('entityType', 'seo');
  data.append('entityId', safeEntityId);
  data.append('image', file);

  const query = new URLSearchParams({
    entityType: 'seo',
    entityId: safeEntityId
  }).toString();

  const response = await fetch(`/api/panel/uploads/image?${query}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: data
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'No se pudo subir la imagen SEO.');
  }

  return String(payload.url || '').trim();
}

async function uploadSeoOgImage(file) {
  return uploadSeoImage(file, 'open-graph');
}

async function uploadSeoTwitterImage(file) {
  return uploadSeoImage(file, 'twitter-cards');
}

function setupOgImagesUI() {
  const urlInput = document.getElementById('og-image-url-input');
  const addBtn = document.getElementById('og-image-add-btn');
  const uploadBtn = document.getElementById('og-image-upload-btn');
  const fileInput = document.getElementById('og-image-file-input');

  renderOgImagesList();

  if (addBtn && urlInput) {
    addBtn.addEventListener('click', () => {
      const added = addOgImageUrl(urlInput.value);
      if (!added) {
        showMessage('Ingresa una URL valida y no duplicada.', true);
        return;
      }
      urlInput.value = '';
      showMessage('Imagen Open Graph agregada.');
    });
  }

  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', async () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) {
        showMessage('Selecciona una imagen para subir.', true);
        return;
      }

      uploadBtn.disabled = true;
      uploadBtn.textContent = 'Subiendo...';
      try {
        const uploadedUrl = await uploadSeoOgImage(file);
        if (!uploadedUrl) throw new Error('No se recibió URL de imagen.');
        addOgImageUrl(uploadedUrl, ogImagesState.length === 0);
        fileInput.value = '';
        showMessage('Imagen Open Graph subida correctamente.');
      } catch (error) {
        showMessage(error.message, true);
      } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Subir imagen';
      }
    });
  }
}

function syncTwitterImageInput() {
  const hiddenInput = formEl.elements.namedItem('seoTwitterImageUrl');
  if (!hiddenInput) return;
  hiddenInput.value = twitterImageState || '';
}

function renderTwitterImagePreview() {
  const previewImg = document.getElementById('twitter-image-preview');
  const emptyMessage = document.getElementById('twitter-image-empty');
  const currentUrl = document.getElementById('twitter-image-current-url');

  if (!previewImg || !emptyMessage || !currentUrl) {
    syncTwitterImageInput();
    return;
  }

  const url = String(twitterImageState || '').trim();
  if (url) {
    previewImg.src = url;
    previewImg.classList.remove('hidden');
    emptyMessage.classList.add('hidden');
    currentUrl.textContent = url;
  } else {
    previewImg.removeAttribute('src');
    previewImg.classList.add('hidden');
    emptyMessage.classList.remove('hidden');
    currentUrl.textContent = '';
  }

  syncTwitterImageInput();
}

function setTwitterImage(url) {
  twitterImageState = String(url || '').trim();
  renderTwitterImagePreview();
}

function setupTwitterImageUI() {
  const urlInput = document.getElementById('twitter-image-url-input');
  const setBtn = document.getElementById('twitter-image-set-btn');
  const uploadBtn = document.getElementById('twitter-image-upload-btn');
  const clearBtn = document.getElementById('twitter-image-clear-btn');
  const fileInput = document.getElementById('twitter-image-file-input');

  renderTwitterImagePreview();

  if (setBtn && urlInput) {
    setBtn.addEventListener('click', () => {
      const next = String(urlInput.value || '').trim();
      if (!next) {
        showMessage('Ingresa una URL de imagen para Twitter.', true);
        return;
      }
      setTwitterImage(next);
      showMessage('Imagen de Twitter actualizada.');
    });
  }

  if (clearBtn && urlInput) {
    clearBtn.addEventListener('click', () => {
      urlInput.value = '';
      setTwitterImage('');
      showMessage('Imagen de Twitter limpiada.');
    });
  }

  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', async () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) {
        showMessage('Selecciona una imagen para subir.', true);
        return;
      }

      uploadBtn.disabled = true;
      uploadBtn.textContent = 'Subiendo...';
      try {
        const uploadedUrl = await uploadSeoTwitterImage(file);
        if (!uploadedUrl) throw new Error('No se recibió URL de imagen.');
        setTwitterImage(uploadedUrl);
        if (urlInput) urlInput.value = uploadedUrl;
        fileInput.value = '';
        showMessage('Imagen Twitter subida correctamente.');
      } catch (error) {
        showMessage(error.message, true);
      } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Subir imagen';
      }
    });
  }
}

function normalizeHreflangEntry(item) {
  if (!item || typeof item !== 'object') return null;
  const lang = String(item.lang || '')
    .trim()
    .toLowerCase();
  const url = String(item.url || '').trim();
  if (!lang || !url) return null;
  if (!/^(x-default|[a-z]{2,3}(?:-[a-z0-9]{2,8})*)$/i.test(lang)) return null;
  return { lang, url };
}

function parseHreflangValue(value) {
  if (!value) return [];
  let parsed = [];
  if (Array.isArray(value)) {
    parsed = value;
  } else if (typeof value === 'string') {
    const raw = value.trim();
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
    const entry = normalizeHreflangEntry(item);
    if (!entry) return;
    const key = `${entry.lang}|${entry.url}`;
    if (seen.has(key)) return;
    seen.add(key);
    normalized.push(entry);
  });
  return normalized.slice(0, 20);
}

function syncHreflangInput() {
  const hiddenInput = formEl.elements.namedItem('seoAdvancedHreflangJson');
  if (!hiddenInput) return;
  hiddenInput.value = JSON.stringify(hreflangState);
}

function renderHreflangList() {
  const listEl = document.getElementById('hreflang-list');
  if (!listEl) {
    syncHreflangInput();
    return;
  }

  if (!hreflangState.length) {
    listEl.innerHTML = '<p class="text-xs text-slate-400">Sin idiomas cargados.</p>';
    syncHreflangInput();
    return;
  }

  listEl.innerHTML = hreflangState
    .map(
      (entry, index) => `
      <div class="rounded-lg border border-white/10 bg-slate-900/50 p-2">
        <div class="flex items-center gap-2">
          <span class="inline-flex rounded-md border border-sky-300/40 px-2 py-0.5 text-[11px] text-sky-200">${entry.lang}</span>
          <button
            type="button"
            data-hreflang-remove="${index}"
            class="ml-auto rounded border border-rose-400/40 px-2 py-1 text-[11px] text-rose-300"
          >
            Borrar
          </button>
        </div>
        <p class="mt-1 truncate text-[11px] text-slate-400">${entry.url}</p>
      </div>
    `
    )
    .join('');

  listEl.querySelectorAll('[data-hreflang-remove]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = Number(btn.dataset.hreflangRemove);
      if (!Number.isInteger(index)) return;
      hreflangState = hreflangState.filter((_item, i) => i !== index);
      renderHreflangList();
    });
  });

  syncHreflangInput();
}

function setupHreflangUI() {
  const langInput = document.getElementById('hreflang-lang-input');
  const urlInput = document.getElementById('hreflang-url-input');
  const addBtn = document.getElementById('hreflang-add-btn');

  renderHreflangList();

  if (addBtn && langInput && urlInput) {
    addBtn.addEventListener('click', () => {
      const nextEntry = normalizeHreflangEntry({ lang: langInput.value, url: urlInput.value });
      if (!nextEntry) {
        showMessage('Idioma/URL de hreflang invalido.', true);
        return;
      }
      const exists = hreflangState.some((entry) => entry.lang === nextEntry.lang && entry.url === nextEntry.url);
      if (exists) {
        showMessage('Ese hreflang ya existe.', true);
        return;
      }
      hreflangState = [...hreflangState, nextEntry].slice(0, 20);
      langInput.value = '';
      urlInput.value = '';
      renderHreflangList();
      showMessage('Hreflang agregado.');
    });
  }
}

const GOOGLE_2026_SWITCH_BINDINGS = [
  ['seoGoogle2026RolloutWindowEnabled', 'seoGoogle2026RolloutWindow'],
  ['seoGoogle2026TechnicalSeoEnabled', 'seoGoogle2026TechnicalSeo'],
  ['seoGoogle2026CoreWebVitalsEnabled', 'seoGoogle2026CoreWebVitals'],
  ['seoGoogle2026ContentQualityEnabled', 'seoGoogle2026ContentQuality'],
  ['seoGoogle2026SecurityMaintenanceEnabled', 'seoGoogle2026SecurityMaintenance'],
  ['seoGoogle2026LocalAuthorityEnabled', 'seoGoogle2026LocalAuthority'],
  ['seoGoogle2026UserExperienceEnabled', 'seoGoogle2026UserExperience'],
  ['seoGoogle2026CompetitiveAdvantageEnabled', 'seoGoogle2026CompetitiveAdvantage']
];

function applyGoogle2026SwitchState() {
  const moduleInput = formEl.elements.namedItem('seoGoogle2026Enabled');
  const moduleEnabled = moduleInput ? Boolean(moduleInput.checked) : true;

  GOOGLE_2026_SWITCH_BINDINGS.forEach(([enabledKey, contentKey]) => {
    const enabledInput = formEl.elements.namedItem(enabledKey);
    const contentInput = formEl.elements.namedItem(contentKey);
    if (!enabledInput || !contentInput) return;

    enabledInput.disabled = !moduleEnabled;
    enabledInput.classList.toggle('opacity-50', !moduleEnabled);

    const isEnabled = moduleEnabled && Boolean(enabledInput.checked);
    contentInput.disabled = !isEnabled;
    contentInput.classList.toggle('opacity-50', !isEnabled);
  });
}

function setupGoogle2026SwitchesUI() {
  const moduleInput = formEl.elements.namedItem('seoGoogle2026Enabled');
  if (moduleInput) {
    moduleInput.addEventListener('change', applyGoogle2026SwitchState);
  }

  GOOGLE_2026_SWITCH_BINDINGS.forEach(([enabledKey]) => {
    const enabledInput = formEl.elements.namedItem(enabledKey);
    if (!enabledInput) return;
    enabledInput.addEventListener('change', applyGoogle2026SwitchState);
  });

  applyGoogle2026SwitchState();
}

const SEO_IMAGES_SWITCH_BINDINGS = [
  ['seoImagesFileNamesEnabled', 'seoImagesFileNames'],
  ['seoImagesResizeEnabled', 'seoImagesResize'],
  ['seoImagesCompressionEnabled', 'seoImagesCompression'],
  ['seoImagesFormatEnabled', 'seoImagesFormat'],
  ['seoImagesSitemapEnabled', 'seoImagesSitemap'],
  ['seoImagesCdnEnabled', 'seoImagesCdn'],
  ['seoImagesLazyLoadingEnabled', 'seoImagesLazyLoading'],
  ['seoImagesBrowserCacheEnabled', 'seoImagesBrowserCache'],
  ['seoImagesStructuredDataEnabled', 'seoImagesStructuredData'],
  ['seoImagesSocialTagsEnabled', 'seoImagesSocialTags'],
  ['seoImagesAuditEnabled', 'seoImagesAudit']
];

function applySeoImagesSwitchState() {
  const moduleInput = formEl.elements.namedItem('seoImagesModuleEnabled');
  const moduleEnabled = moduleInput ? Boolean(moduleInput.checked) : true;

  SEO_IMAGES_SWITCH_BINDINGS.forEach(([enabledKey, contentKey]) => {
    const enabledInput = formEl.elements.namedItem(enabledKey);
    const contentInput = formEl.elements.namedItem(contentKey);
    if (!enabledInput || !contentInput) return;

    enabledInput.disabled = !moduleEnabled;
    enabledInput.classList.toggle('opacity-50', !moduleEnabled);

    const isEnabled = moduleEnabled && Boolean(enabledInput.checked);
    contentInput.disabled = !isEnabled;
    contentInput.classList.toggle('opacity-50', !isEnabled);
  });
}

function setupSeoImagesSwitchesUI() {
  const moduleInput = formEl.elements.namedItem('seoImagesModuleEnabled');
  if (moduleInput) {
    moduleInput.addEventListener('change', applySeoImagesSwitchState);
  }

  SEO_IMAGES_SWITCH_BINDINGS.forEach(([enabledKey]) => {
    const enabledInput = formEl.elements.namedItem(enabledKey);
    if (!enabledInput) return;
    enabledInput.addEventListener('change', applySeoImagesSwitchState);
  });

  applySeoImagesSwitchState();
}

const TECH_FILES_SWITCH_BINDINGS = [
  ['seoSitemapGeneratorEnabled', 'seoSitemapGeneratorNotes'],
  ['seoRobotsTxtEnabled', 'seoRobotsTxtContent'],
  ['seoHtaccessEnabled', 'seoHtaccessContent']
];

function applyTechFilesSwitchState() {
  const moduleInput = formEl.elements.namedItem('seoTechFilesEnabled');
  const moduleEnabled = moduleInput ? Boolean(moduleInput.checked) : true;

  TECH_FILES_SWITCH_BINDINGS.forEach(([enabledKey, contentKey]) => {
    const enabledInput = formEl.elements.namedItem(enabledKey);
    const contentInput = formEl.elements.namedItem(contentKey);
    if (!enabledInput || !contentInput) return;

    enabledInput.disabled = !moduleEnabled;
    enabledInput.classList.toggle('opacity-50', !moduleEnabled);

    const isEnabled = moduleEnabled && Boolean(enabledInput.checked);
    contentInput.disabled = !isEnabled;
    contentInput.classList.toggle('opacity-50', !isEnabled);
  });
}

function setupTechFilesSwitchesUI() {
  const moduleInput = formEl.elements.namedItem('seoTechFilesEnabled');
  if (moduleInput) {
    moduleInput.addEventListener('change', applyTechFilesSwitchState);
  }

  TECH_FILES_SWITCH_BINDINGS.forEach(([enabledKey]) => {
    const enabledInput = formEl.elements.namedItem(enabledKey);
    if (!enabledInput) return;
    enabledInput.addEventListener('change', applyTechFilesSwitchState);
  });

  applyTechFilesSwitchState();
}

function updateImagePreview(url) {
  const previewEl = document.getElementById('image-preview');
  if (!previewEl) return;

  if (url) {
    previewEl.src = url;
    previewEl.classList.remove('hidden');
  } else {
    previewEl.removeAttribute('src');
    previewEl.classList.add('hidden');
  }
}

function renderMultiPreview(files) {
  const root = document.getElementById('images-preview-list');
  if (!root) return;
  if (!files || !files.length) {
    root.innerHTML = '';
    return;
  }

  root.innerHTML = files
    .filter((file) => file.type && file.type.startsWith('image/'))
    .slice(0, 12)
    .map((file) => {
      const objectUrl = URL.createObjectURL(file);
      return `<img src="${objectUrl}" alt="preview" class="h-20 w-20 rounded-lg border border-white/10 object-cover" />`;
    })
    .join('');
}

function renderProductUploadPreview(files) {
  const root = document.getElementById('product-upload-preview-list');
  if (!root) return;
  if (!files || !files.length) {
    root.innerHTML = '';
    return;
  }

  root.innerHTML = files
    .filter((file) => file.type && file.type.startsWith('image/'))
    .map((file, index) => {
      const objectUrl = URL.createObjectURL(file);
      const checked = index === productPrimaryIndex ? 'checked' : '';
      return `
        <label class="rounded-xl border border-white/10 bg-slate-900/60 p-2">
          <img src="${objectUrl}" alt="preview-${index + 1}" class="h-24 w-full rounded-lg object-cover" />
          <span class="mt-2 flex items-center gap-2 text-xs text-slate-200">
            <input type="radio" name="product-primary-pick" value="${index}" ${checked} />
            Principal
          </span>
          <span class="mt-1 block truncate text-[11px] text-slate-400">${file.name}</span>
        </label>
      `;
    })
    .join('');

  root.querySelectorAll('input[name="product-primary-pick"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const next = Number(radio.value);
      if (!Number.isInteger(next) || next < 0) return;
      productPrimaryIndex = next;
    });
  });
}

function setProductUploadProgress({ active = false, current = 0, total = 0, message = '' } = {}) {
  const statusEl = document.getElementById('product-upload-status');
  const spinnerEl = document.getElementById('product-upload-spinner');
  if (!statusEl || !spinnerEl) return;

  if (active) {
    spinnerEl.classList.remove('hidden');
    if (message) {
      statusEl.textContent = message;
    } else {
      statusEl.textContent = total > 0 ? `Subiendo ${current}/${total}...` : 'Procesando imágenes...';
    }
  } else {
    spinnerEl.classList.add('hidden');
    statusEl.textContent = message || 'Sin tareas pendientes.';
  }
}

async function uploadImageFile(file, productId = null) {
  const token = getAuthToken();
  if (!token) {
    window.location.replace('/panel/login.html');
    return null;
  }

  const data = new FormData();
  const params = new URLSearchParams();
  if (productId) {
    data.append('productId', String(productId));
    data.append('entityType', 'product');
    data.append('entityId', String(productId));
    params.set('productId', String(productId));
    params.set('entityType', 'product');
    params.set('entityId', String(productId));
  }
  data.append('image', file);
  const query = params.toString() ? `?${params.toString()}` : '';

  const response = await fetch(`/api/panel/uploads/image${query}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: data
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'No se pudo subir la imagen.');
  return payload.url;
}

async function uploadImageFiles(files, productId = null) {
  const token = getAuthToken();
  if (!token) {
    window.location.replace('/panel/login.html');
    return [];
  }

  const data = new FormData();
  const params = new URLSearchParams();
  if (productId) {
    data.append('productId', String(productId));
    data.append('entityType', 'product');
    data.append('entityId', String(productId));
    params.set('productId', String(productId));
    params.set('entityType', 'product');
    params.set('entityId', String(productId));
  }
  files.forEach((file) => data.append('images', file));
  const query = params.toString() ? `?${params.toString()}` : '';

  const response = await fetch(`/api/panel/uploads/images${query}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: data
  });

  const payload = await response.json().catch(() => ({}));
  if (response.ok) {
    return Array.isArray(payload.urls) ? payload.urls : [];
  }

  if (response.status === 404 || response.status === 405) {
    const urls = [];
    for (const file of files) {
      const url = await uploadImageFile(file, productId);
      if (url) urls.push(url);
    }
    return urls;
  }

  throw new Error(payload.error || 'No se pudieron subir las imagenes.');
}

async function uploadMultipleProductImages(files) {
  const productIdInput = formEl.elements.namedItem('productId');
  const productIdSelect = document.getElementById('product-id-select');
  const altTextInput = formEl.elements.namedItem('altText');
  const sortOrderInput = formEl.elements.namedItem('sortOrder');

  const productIdFromInput = Number(productIdInput ? productIdInput.value : 0);
  const productIdFromSelect = Number(productIdSelect ? productIdSelect.value : 0);
  const productId = Number.isInteger(productIdFromInput) && productIdFromInput > 0 ? productIdFromInput : productIdFromSelect;
  if (!Number.isInteger(productId) || productId <= 0) {
    throw new Error('Ingresa un ID de producto valido para carga multiple.');
  }

  const baseSort = Number(sortOrderInput ? sortOrderInput.value : 0);
  const startSort = Number.isFinite(baseSort) ? baseSort : 0;
  const altBase = String(altTextInput ? altTextInput.value : '').trim();

  let created = 0;
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    if (!file.type || !file.type.startsWith('image/')) continue;

    const url = await uploadImageFile(file, productId);
    await requestJson(`${API_BASE}/product-images`, {
      method: 'POST',
      body: JSON.stringify({
        productId,
        url,
        altText: altBase || file.name,
        sortOrder: startSort + i
      })
    });
    created += 1;
  }

  if (!created) {
    throw new Error('No se subieron imagenes validas.');
  }

  return created;
}

async function populateProductSelector() {
  const selectEl = document.getElementById('product-id-select');
  const productIdInput = formEl.elements.namedItem('productId');
  if (!selectEl || !productIdInput) return;

  try {
    const products = await requestJson(`${API_BASE}/products`);
    if (!Array.isArray(products)) return;

    selectEl.innerHTML = `
      <option value="">Seleccionar producto...</option>
      ${products.map((p) => `<option value="${p.id}">#${p.id} - ${p.name}</option>`).join('')}
    `;

    const current = Number(productIdInput.value || 0);
    if (Number.isInteger(current) && current > 0) {
      selectEl.value = String(current);
    }

    selectEl.addEventListener('change', () => {
      if (!selectEl.value) return;
      productIdInput.value = selectEl.value;
    });

    productIdInput.addEventListener('input', () => {
      const value = String(productIdInput.value || '');
      if (!value) {
        selectEl.value = '';
        return;
      }
      const option = selectEl.querySelector(`option[value="${value}"]`);
      if (option) {
        selectEl.value = value;
      }
    });
  } catch (error) {
    showMessage(`No se pudo cargar selector de productos: ${error.message}`, true);
  }
}

async function populateProductCategorySelect(selectedValue = '') {
  const selectEl = formEl.elements.namedItem('category');
  if (!selectEl || activeView !== 'products') return;

  try {
    const categories = await requestJson(`${API_BASE}/categories`);
    if (!Array.isArray(categories)) return;

    const options = categories.map((c) => `<option value="${c.name}">${c.name}</option>`).join('');
    selectEl.innerHTML = `<option value="">Seleccionar categoria...</option>${options}`;
    if (selectedValue) {
      const exists = categories.some((c) => c.name === selectedValue);
      if (exists) {
        selectEl.value = selectedValue;
      } else {
        const extra = document.createElement('option');
        extra.value = selectedValue;
        extra.textContent = `${selectedValue} (actual)`;
        selectEl.appendChild(extra);
        selectEl.value = selectedValue;
      }
    } else {
      selectEl.value = '';
    }
  } catch (error) {
    showMessage(`No se pudieron cargar categorias: ${error.message}`, true);
  }
}

function setupProductImageUI() {
  const imageUrlInput = formEl.elements.namedItem('imageUrl');
  const imageFilesInput = document.getElementById('product-images-files');
  if (!imageUrlInput || !imageFilesInput) return;

  imageFilesInput.addEventListener('change', () => {
    const files = Array.from(imageFilesInput.files || []);
    const valid = files.filter((file) => file.type && file.type.startsWith('image/'));
    productUploadFiles = valid;
    productPrimaryIndex = 0;
    renderProductUploadPreview(valid);
  });

  renderProductUploadPreview([]);
  setProductUploadProgress({ active: false, message: 'Sin tareas pendientes.' });

  if (editingId) {
    renderProductImagesManager(editingId);
  }
}

async function processPendingProductImages(productId) {
  const files = productUploadFiles;
  if (!Array.isArray(files) || !files.length) return { created: 0, principalUrl: null };

  const rows = await requestJson(`${API_BASE}/product-images`);
  const currentImages = Array.isArray(rows) ? rows.filter((img) => Number(img.productId) === Number(productId)) : [];
  const maxSort = currentImages.reduce((max, img) => Math.max(max, Number(img.sortOrder || 0)), -1);
  const startSort = maxSort + 1;

  const uploadedUrls = [];
  let created = 0;
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    if (!file || !file.type || !file.type.startsWith('image/')) continue;

    setProductUploadProgress({
      active: true,
      current: i + 1,
      total: files.length,
      message: `Subiendo ${i + 1}/${files.length}: ${file.name}`
    });

    const url = await uploadImageFile(file, productId);
    if (!url) continue;
    uploadedUrls.push(url);

    await requestJson(`${API_BASE}/product-images`, {
      method: 'POST',
      body: JSON.stringify({
        productId,
        url,
        altText: file?.name || 'imagen',
        sortOrder: startSort + i
      })
    });
    created += 1;
  }

  if (!created || !uploadedUrls.length) {
    throw new Error('No se subieron imagenes validas.');
  }

  const principalUrl = uploadedUrls[productPrimaryIndex] || uploadedUrls[0];
  if (principalUrl) {
    await requestJson(`${API_BASE}/products/${productId}/image`, {
      method: 'PATCH',
      body: JSON.stringify({ imageUrl: principalUrl })
    });
  }

  const imageUrlInput = formEl.elements.namedItem('imageUrl');
  if (imageUrlInput && principalUrl) {
    imageUrlInput.value = principalUrl;
  }

  const imageFilesInput = document.getElementById('product-images-files');
  if (imageFilesInput) imageFilesInput.value = '';
  productUploadFiles = [];
  productPrimaryIndex = 0;
  renderProductUploadPreview([]);
  setProductUploadProgress({ active: false, message: `Subida completa: ${created} imagen(es).` });

  return { created, principalUrl };
}

async function renderProductImagesManager(productId) {
  const container = document.getElementById('product-images-manager');
  if (!container || !productId) return;

  try {
    const rows = await requestJson(`${API_BASE}/product-images`);
    const images = Array.isArray(rows)
      ? rows
          .filter((img) => Number(img.productId) === Number(productId))
          .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0) || Number(a.id) - Number(b.id))
      : [];

    if (!images.length) {
      container.innerHTML = '<p class="text-xs text-slate-400">Este producto aun no tiene galeria.</p>';
      return;
    }

    container.innerHTML = images
      .map(
        (img, index) => `
      <article class="product-image-item rounded-xl border border-white/10 bg-slate-900/60 p-2" draggable="true" data-img-id="${img.id}" data-img-index="${index}">
        <img src="${img.url}" alt="${img.altText || 'img'}" class="h-24 w-full rounded-lg object-cover" />
        <p class="mt-1 truncate text-[11px] text-slate-400">${img.url}</p>
        <div class="mt-2 flex gap-1">
          <button
            type="button"
            data-img-main="${img.id}"
            class="has-tooltip inline-flex h-7 w-7 items-center justify-center rounded border border-sky-300/40 text-sky-200"
            aria-label="Marcar principal"
            data-tooltip="Principal"
          >
            <span class="lucide h-3.5 w-3.5" data-lucide="star"></span>
          </button>
          <button
            type="button"
            data-img-up="${img.id}"
            class="has-tooltip inline-flex h-7 w-7 items-center justify-center rounded border border-white/20 text-slate-100"
            aria-label="Mover arriba"
            data-tooltip="Subir"
          >
            <span class="lucide h-3.5 w-3.5" data-lucide="arrow-up"></span>
          </button>
          <button
            type="button"
            data-img-down="${img.id}"
            class="has-tooltip inline-flex h-7 w-7 items-center justify-center rounded border border-white/20 text-slate-100"
            aria-label="Mover abajo"
            data-tooltip="Bajar"
          >
            <span class="lucide h-3.5 w-3.5" data-lucide="arrow-down"></span>
          </button>
          <button
            type="button"
            data-img-del="${img.id}"
            class="has-tooltip inline-flex h-7 w-7 items-center justify-center rounded border border-rose-400/40 text-rose-300"
            aria-label="Borrar imagen"
            data-tooltip="Borrar"
          >
            <span class="lucide h-3.5 w-3.5" data-lucide="trash-2"></span>
          </button>
          <span class="ml-auto text-[11px] text-slate-500">#${index + 1}</span>
        </div>
      </article>
    `
      )
      .join('');

    if (window.lucide?.createIcons) {
      window.lucide.createIcons();
    }

    container.querySelectorAll('[data-img-del]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const imageId = Number(btn.dataset.imgDel);
        if (!confirm(`Eliminar imagen ${imageId}?`)) return;
        try {
          await requestJson(`${API_BASE}/product-images/${imageId}`, { method: 'DELETE' });
          await renderProductImagesManager(productId);
          showMessage(`Imagen ${imageId} eliminada.`);
        } catch (error) {
          showMessage(error.message, true);
        }
      });
    });

    container.querySelectorAll('[data-img-main]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const imageId = Number(btn.dataset.imgMain);
        const selected = images.find((img) => Number(img.id) === imageId);
        if (!selected) return;
        try {
          await requestJson(`${API_BASE}/products/${productId}/image`, {
            method: 'PATCH',
            body: JSON.stringify({
              imageUrl: selected.url
            })
          });
          const imageUrlInput = formEl.elements.namedItem('imageUrl');
          if (imageUrlInput) imageUrlInput.value = selected.url;
          showMessage(`Imagen ${imageId} marcada como principal.`);
        } catch (error) {
          showMessage(error.message, true);
        }
      });
    });

    const move = async (imageId, direction) => {
      const current = images.find((img) => Number(img.id) === Number(imageId));
      if (!current) return;
      const idx = images.findIndex((img) => Number(img.id) === Number(imageId));
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= images.length) return;
      const target = images[swapIdx];
      try {
        await requestJson(`${API_BASE}/product-images/${current.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            productId: current.productId,
            url: current.url,
            altText: current.altText || '',
            sortOrder: target.sortOrder
          })
        });
        await requestJson(`${API_BASE}/product-images/${target.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            productId: target.productId,
            url: target.url,
            altText: target.altText || '',
            sortOrder: current.sortOrder
          })
        });
        await renderProductImagesManager(productId);
        showMessage('Orden de imagenes actualizado.');
      } catch (error) {
        showMessage(error.message, true);
      }
    };

    container.querySelectorAll('[data-img-up]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        await move(Number(btn.dataset.imgUp), 'up');
      });
    });

    container.querySelectorAll('[data-img-down]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        await move(Number(btn.dataset.imgDown), 'down');
      });
    });

    const items = Array.from(container.querySelectorAll('.product-image-item'));
    let draggedIndex = null;
    items.forEach((item) => {
      item.addEventListener('dragstart', () => {
        draggedIndex = Number(item.dataset.imgIndex);
      });
      item.addEventListener('dragover', (event) => {
        event.preventDefault();
      });
      item.addEventListener('drop', async (event) => {
        event.preventDefault();
        const targetIndex = Number(item.dataset.imgIndex);
        if (!Number.isInteger(draggedIndex) || !Number.isInteger(targetIndex) || draggedIndex === targetIndex) return;

        const reordered = [...images];
        const [moved] = reordered.splice(draggedIndex, 1);
        reordered.splice(targetIndex, 0, moved);

        try {
          for (let i = 0; i < reordered.length; i += 1) {
            const img = reordered[i];
            await requestJson(`${API_BASE}/product-images/${img.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                productId: img.productId,
                url: img.url,
                altText: img.altText || '',
                sortOrder: i
              })
            });
          }
          await renderProductImagesManager(productId);
          showMessage('Orden actualizado por drag and drop.');
        } catch (error) {
          showMessage(error.message, true);
        } finally {
          draggedIndex = null;
        }
      });
    });
  } catch (error) {
    container.innerHTML = `<p class="text-xs text-rose-300">${error.message}</p>`;
  }
}

function setupImageUploadUI() {
  const fileInput = formEl.elements.namedItem('imageFile');
  const filesInput = formEl.elements.namedItem('imageFiles');
  const urlInput = formEl.elements.namedItem('url');
  const uploadBtn = document.getElementById('upload-image-btn');
  const uploadManyBtn = document.getElementById('upload-images-btn');
  const productIdInput = formEl.elements.namedItem('productId');

  if (urlInput) {
    urlInput.addEventListener('input', () => {
      if (!fileInput || !fileInput.files || !fileInput.files[0]) {
        updateImagePreview(urlInput.value);
      }
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) {
        updateImagePreview(urlInput.value || '');
        return;
      }

      if (!file.type.startsWith('image/')) {
        showMessage('El archivo debe ser de tipo imagen.', true);
        fileInput.value = '';
        updateImagePreview(urlInput.value || '');
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      updateImagePreview(objectUrl);
    });
  }

  if (filesInput) {
    filesInput.addEventListener('change', () => {
      const files = Array.from(filesInput.files || []);
      renderMultiPreview(files);
    });
  }

  if (uploadBtn) {
    uploadBtn.addEventListener('click', async () => {
      const file = fileInput && fileInput.files && fileInput.files[0];
      if (!file) {
        showMessage('Selecciona una imagen antes de subir.', true);
        return;
      }

      if (!urlInput) {
        showMessage('No se encontro el campo URL para asignar la imagen.', true);
        return;
      }

      uploadBtn.disabled = true;
      uploadBtn.textContent = 'Subiendo...';

      try {
        const currentProductId = Number(productIdInput ? productIdInput.value : 0);
        const targetProductId =
          Number.isInteger(currentProductId) && currentProductId > 0 ? currentProductId : null;
        const uploadedUrl = await uploadImageFile(file, targetProductId);
        if (!uploadedUrl) return;

        urlInput.value = uploadedUrl;
        updateImagePreview(urlInput.value);

        if (activeView === 'product-images' && editingId) {
          const altTextInput = formEl.elements.namedItem('altText');
          const sortOrderInput = formEl.elements.namedItem('sortOrder');

          await requestJson(`${API_BASE}/product-images/${editingId}`, {
            method: 'PUT',
            body: JSON.stringify({
              productId: productIdInput ? productIdInput.value : '',
              url: urlInput.value,
              altText: altTextInput ? altTextInput.value : '',
              sortOrder: sortOrderInput ? sortOrderInput.value : 0
            })
          });

          await renderRows();
          showMessage(`Imagen subida y URL actualizada en DB para ID ${editingId}.`);
        } else {
          showMessage('Imagen subida correctamente.');
        }
      } catch (error) {
        showMessage(error.message, true);
      } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Subir imagen';
      }
    });
  }

  if (uploadManyBtn) {
    uploadManyBtn.addEventListener('click', async () => {
      const files = Array.from((filesInput && filesInput.files) || []);
      if (!files.length) {
        showMessage('Selecciona varias imagenes para subir.', true);
        return;
      }

      uploadManyBtn.disabled = true;
      uploadManyBtn.textContent = 'Subiendo...';

      try {
        const created = await uploadMultipleProductImages(files);
        if (filesInput) filesInput.value = '';
        renderMultiPreview([]);
        await renderRows();
        showMessage(`Se subieron y guardaron ${created} imagen(es) en la base de datos.`);
      } catch (error) {
        showMessage(error.message, true);
      } finally {
        uploadManyBtn.disabled = false;
        uploadManyBtn.textContent = 'Subir varias y crear registros';
      }
    });
  }
}

function renderForm() {
  const cfg = getConfig();
  const tabsHtml = Array.isArray(cfg.tabs) && cfg.tabs.length
    ? `
      <div id="form-tabs" class="sm:col-span-2 mb-2 flex flex-wrap gap-2">
        ${cfg.tabs
          .map(
            (tab) => `
          <button
            type="button"
            data-form-tab="${tab.id}"
            class="rounded-xl border border-white/15 px-3 py-1.5 text-xs text-slate-300 transition hover:border-sky-300/40 hover:text-white"
          >
            ${tab.label}
          </button>
        `
          )
          .join('')}
      </div>
    `
    : '';

  let html = cfg.fields
    .map((field) => {
      const colClass = field.colSpan === 2 ? 'sm:col-span-2' : '';
      const tabClass = field.tab ? 'form-tab-item' : '';
      const tabAttr = field.tab ? `data-field-tab="${field.tab}"` : '';
      const placeholderAttr = field.placeholder ? `placeholder="${field.placeholder}"` : '';
      const hasLengthHint = Number.isInteger(field.recommendedMin) || Number.isInteger(field.recommendedMax);
      const lengthHintId = hasLengthHint ? `length-hint-${field.key}` : '';
      const hintMin = Number(field.recommendedMin || 0);
      const hintMax = Number(field.recommendedMax || 0);
      const lengthAttrs = hasLengthHint
        ? `data-length-target="${lengthHintId}" data-length-min="${hintMin}" data-length-max="${hintMax}"`
        : '';
      let optimalHint = '';
      if (hasLengthHint) {
        if (hintMin > 0 && hintMax > 0) {
          optimalHint = `<p class="mt-1 text-[11px] text-slate-500">Optimo: ${hintMin}-${hintMax} caracteres</p>`;
        } else if (hintMax > 0) {
          optimalHint = `<p class="mt-1 text-[11px] text-slate-500">Maximo recomendado: ${hintMax} caracteres</p>`;
        } else if (hintMin > 0) {
          optimalHint = `<p class="mt-1 text-[11px] text-slate-500">Minimo recomendado: ${hintMin} caracteres</p>`;
        }
      }
      const helperText = field.helperText ? `<p class="mt-1 text-[11px] text-slate-400">${field.helperText}</p>` : '';
      const lengthHint = hasLengthHint ? `<p id="${lengthHintId}" class="mt-1 text-xs text-slate-400"></p>${optimalHint}` : '';

      if (field.type === 'textarea') {
        return `
          <label ${tabAttr} class="text-sm text-slate-200 ${colClass} ${tabClass}">
            ${field.label}
            <textarea
              name="${field.key}"
              ${field.required ? 'required' : ''}
              ${placeholderAttr}
              ${lengthAttrs}
              rows="4"
              class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm"
            ></textarea>
            ${lengthHint}
            ${helperText}
          </label>
        `;
      }

      if (field.type === 'file' || field.type === 'file-multiple') {
        const isMultiple = field.type === 'file-multiple';
        return `
          <label ${tabAttr} class="text-sm text-slate-200 ${colClass} ${tabClass}">
            ${field.label}
            <input name="${field.key}" type="file" accept="image/*" ${isMultiple ? 'multiple' : ''} ${field.required ? 'required' : ''} class="file-picker mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm" />
          </label>
        `;
      }

      if (field.type === 'section') {
        return `
          <div ${tabAttr} class="${colClass} ${tabClass} rounded-xl border border-white/10 bg-slate-900/55 px-3 py-2">
            <p class="text-xs uppercase tracking-wide text-slate-400">${field.label}</p>
            ${field.description ? `<p class="mt-1 text-xs text-slate-300">${field.description}</p>` : ''}
          </div>
        `;
      }

      if (field.type === 'og-images') {
        return `
          <div ${tabAttr} class="${colClass} ${tabClass} rounded-xl border border-white/10 bg-slate-950/40 p-3 space-y-3">
            <input name="${field.key}" type="hidden" />
            <div>
              <p class="text-sm text-slate-200">${field.label}</p>
              <p class="mt-1 text-xs text-slate-400">
                Recommended: 1200x630 pixels for optimal display on Facebook and LinkedIn.
              </p>
            </div>
            <div class="grid gap-2 sm:grid-cols-2">
              <label class="text-sm text-slate-200">
                URL Imagen
                <input
                  id="og-image-url-input"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm"
                />
              </label>
              <label class="text-sm text-slate-200">
                Upload Image
                <input id="og-image-file-input" type="file" accept="image/*" class="file-picker mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm" />
              </label>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                id="og-image-upload-btn"
                class="rounded-xl border border-sky-300/30 bg-sky-500/20 px-3 py-2 text-sm text-sky-100 transition hover:bg-sky-500/35"
              >
                Subir imagen
              </button>
              <button
                type="button"
                id="og-image-add-btn"
                class="rounded-xl border border-white/20 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-800/70"
              >
                + Add Another Image
              </button>
            </div>
            <div id="og-images-list" class="grid gap-2 sm:grid-cols-2"></div>
          </div>
        `;
      }

      if (field.type === 'twitter-image') {
        return `
          <div ${tabAttr} class="${colClass} ${tabClass} rounded-xl border border-white/10 bg-slate-950/40 p-3 space-y-3">
            <input name="${field.key}" type="hidden" />
            <div>
              <p class="text-sm text-slate-200">${field.label}</p>
              <p class="mt-1 text-xs text-slate-400">Recommended: 1200x628 pixels (1.91:1 ratio).</p>
            </div>
            <div class="grid gap-2 sm:grid-cols-2">
              <label class="text-sm text-slate-200">
                Image URL
                <input
                  id="twitter-image-url-input"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm"
                />
              </label>
              <label class="text-sm text-slate-200">
                Upload Image
                <input id="twitter-image-file-input" type="file" accept="image/*" class="file-picker mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm" />
              </label>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                id="twitter-image-upload-btn"
                class="rounded-xl border border-sky-300/30 bg-sky-500/20 px-3 py-2 text-sm text-sky-100 transition hover:bg-sky-500/35"
              >
                Subir imagen
              </button>
              <button
                type="button"
                id="twitter-image-set-btn"
                class="rounded-xl border border-white/20 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-800/70"
              >
                Usar URL
              </button>
              <button
                type="button"
                id="twitter-image-clear-btn"
                class="rounded-xl border border-white/20 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-800/70"
              >
                Limpiar
              </button>
            </div>
            <div class="rounded-xl border border-white/10 bg-slate-900/50 p-2">
              <img id="twitter-image-preview" alt="Preview Twitter image" class="hidden h-36 w-full rounded-lg object-cover" />
              <p id="twitter-image-empty" class="text-xs text-slate-400">Sin imagen configurada.</p>
              <p id="twitter-image-current-url" class="mt-1 truncate text-[11px] text-slate-500"></p>
            </div>
          </div>
        `;
      }

      if (field.type === 'hreflang-list') {
        return `
          <div ${tabAttr} class="${colClass} ${tabClass} rounded-xl border border-white/10 bg-slate-950/40 p-3 space-y-3">
            <input name="${field.key}" type="hidden" />
            <div>
              <p class="text-sm text-slate-200">${field.label}</p>
              <p class="mt-1 text-xs text-slate-400">Multi-language alternate URLs (ej: en, es-AR, x-default).</p>
            </div>
            <div class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_2fr_auto] sm:items-end">
              <label class="text-sm text-slate-200">
                Language
                <input
                  id="hreflang-lang-input"
                  type="text"
                  placeholder="en"
                  class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm"
                />
              </label>
              <label class="text-sm text-slate-200">
                URL
                <input
                  id="hreflang-url-input"
                  type="url"
                  placeholder="https://example.com/en/"
                  class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm"
                />
              </label>
              <button
                type="button"
                id="hreflang-add-btn"
                class="rounded-xl border border-white/20 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-800/70"
              >
                + Add
              </button>
            </div>
            <div id="hreflang-list" class="grid gap-2 sm:grid-cols-2"></div>
          </div>
        `;
      }

      if (field.type === 'hidden') {
        let hiddenHtml = `<input name="${field.key}" type="hidden" />`;

        if (activeView === 'products' && field.key === 'imageUrl') {
          hiddenHtml += `
            <div class="sm:col-span-2 rounded-xl border border-white/10 bg-slate-950/40 p-3 space-y-3">
              <div class="grid gap-2 sm:grid-cols-2">
                <label class="text-sm text-slate-200">
                  Cargar imagenes
                  <input id="product-images-files" type="file" accept="image/*" multiple class="file-picker mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm" />
                </label>
                <div class="text-xs text-slate-400 flex items-end pb-2">Elegi la principal en las previews antes de subir.</div>
              </div>
              <p class="text-xs text-slate-400">Las imagenes seleccionadas se suben al presionar Guardar.</p>
              <div class="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/50 px-3 py-2">
                <span id="product-upload-spinner" class="hidden h-4 w-4 animate-spin rounded-full border-2 border-sky-300/30 border-t-sky-300"></span>
                <span id="product-upload-status" class="text-xs text-slate-300">Sin tareas pendientes.</span>
              </div>
              <div id="product-upload-preview-list" class="grid gap-2 sm:grid-cols-2"></div>
              <div>
                <p class="mb-1 text-xs uppercase tracking-wide text-slate-400">Galeria asociada</p>
                <div id="product-images-manager" class="grid gap-2 sm:grid-cols-2"></div>
              </div>
            </div>
          `;
        }

        return hiddenHtml;
      }

      if (field.type === 'select') {
        const optionsHtml = Array.isArray(field.options) && field.options.length
          ? field.options
              .map((option) => {
                if (typeof option === 'string') {
                  return `<option value="${option}">${option}</option>`;
                }
                return `<option value="${option.value}">${option.label}</option>`;
              })
              .join('')
          : '<option value="">Cargando...</option>';
        return `
          <label ${tabAttr} class="text-sm text-slate-200 ${colClass} ${tabClass}">
            ${field.label}
            <select name="${field.key}" ${field.required ? 'required' : ''} class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm">
              ${optionsHtml}
            </select>
            ${helperText}
          </label>
        `;
      }

      if (field.type === 'switch') {
        const switchId = `switch-${field.key}`;
        return `
          <label ${tabAttr} class="text-sm text-slate-200 ${colClass} ${tabClass}">
            ${field.label}
            <div class="mt-2 flex items-center gap-3">
              <label for="${switchId}" class="inline-flex cursor-pointer items-center">
                <input id="${switchId}" name="${field.key}" type="checkbox" class="peer sr-only" />
                <span class="relative h-6 w-11 rounded-full bg-slate-700/80 transition peer-checked:bg-sky-500/70 peer-focus-visible:ring-2 peer-focus-visible:ring-sky-400/60 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5"></span>
              </label>
              <span class="text-xs text-slate-400">${field.helper || ''}</span>
            </div>
          </label>
        `;
      }

      return `
        <label ${tabAttr} class="text-sm text-slate-200 ${colClass} ${tabClass}">
          ${field.label}
          <input
            name="${field.key}"
            type="${field.type}"
            ${field.required ? 'required' : ''}
            ${placeholderAttr}
            ${lengthAttrs}
            class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm"
          />
          ${lengthHint}
          ${helperText}
        </label>
      `;
    })
    .join('');

  if (activeView === 'product-images') {
    html += `
      <div class="sm:col-span-2 rounded-xl border border-white/10 bg-slate-950/40 p-3 space-y-3">
        <label class="block text-sm text-slate-200">
          Seleccionar producto
          <select id="product-id-select" class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm">
            <option value="">Cargando productos...</option>
          </select>
        </label>
        <div class="flex flex-wrap items-center gap-3">
          <button type="button" id="upload-image-btn" class="rounded-xl border border-sky-300/30 bg-sky-500/20 px-3 py-2 text-sm text-sky-100 transition hover:bg-sky-500/35">
            Subir imagen
          </button>
          <button type="button" id="upload-images-btn" class="rounded-xl border border-white/20 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-800/70">
            Subir varias y crear registros
          </button>
          <span class="text-xs text-slate-400">Solo image/* hasta 5MB por archivo</span>
        </div>
        <img id="image-preview" alt="Vista previa" class="hidden h-40 w-full rounded-xl border border-white/10 object-cover" />
        <div id="images-preview-list" class="grid grid-cols-4 gap-2"></div>
      </div>
    `;
  }

  formEl.innerHTML = `${tabsHtml}${html}`;

  if (Array.isArray(cfg.tabs) && cfg.tabs.length) {
    setupFormTabs(cfg);
  }

  setupLengthHints();

  if (activeView === 'settings') {
    setupOgImagesUI();
    setupTwitterImageUI();
    setupHreflangUI();
    setupGoogle2026SwitchesUI();
    setupSeoImagesSwitchesUI();
    setupTechFilesSwitchesUI();
  }

  if (activeView === 'product-images') {
    setupImageUploadUI();
    populateProductSelector();
  }
  if (activeView === 'products') {
    setupProductImageUI();
    populateProductCategorySelect();
  }
}

function renderTableHead() {
  const cfg = getConfig();
  headEl.innerHTML = [...cfg.columns.map((col) => `<th class="px-3 py-2">${col}</th>`), '<th class="px-3 py-2">acciones</th>'].join('');
}

function fillForm(item) {
  const cfg = getConfig();
  cfg.fields.forEach((field) => {
    const input = formEl.elements.namedItem(field.key);
    if (field.type === 'file' || field.type === 'file-multiple' || field.type === 'section') return;
    if (field.type === 'og-images') {
      ogImagesState = parseOgImagesValue(item[field.key]);
      renderOgImagesList();
      return;
    }
    if (field.type === 'twitter-image') {
      setTwitterImage(item[field.key] || '');
      const urlInput = document.getElementById('twitter-image-url-input');
      if (urlInput) urlInput.value = twitterImageState;
      return;
    }
    if (field.type === 'hreflang-list') {
      hreflangState = parseHreflangValue(item[field.key]);
      renderHreflangList();
      return;
    }
    if (!input) return;
    setFieldValue(field, input, item[field.key] ?? '');
  });

  if (activeView === 'product-images') {
    updateImagePreview(item.url || '');
  }
  if (activeView === 'products') {
    populateProductCategorySelect(item.category || '');
    const productId = Number(item.id || editingId || 0);
    if (Number.isInteger(productId) && productId > 0) {
      renderProductImagesManager(productId);
    }
  }
  if (activeView === 'settings') {
    applyGoogle2026SwitchState();
    applySeoImagesSwitchState();
    applyTechFilesSwitchState();
  }

  formEl.querySelectorAll('[data-length-target]').forEach((input) => {
    updateLengthHint(input);
  });
}

function clearForm() {
  const cfg = getConfig();
  editingId = null;
  productUploadFiles = [];
  productPrimaryIndex = 0;
  ogImagesState = [];
  twitterImageState = '';
  hreflangState = [];
  formEl.reset();
  if (activeView === 'product-images') {
    updateImagePreview('');
    renderMultiPreview([]);
  }
  if (activeView === 'products') {
    const imageUrlInput = formEl.elements.namedItem('imageUrl');
    if (imageUrlInput) imageUrlInput.value = '';
    const imageFilesInput = document.getElementById('product-images-files');
    if (imageFilesInput) imageFilesInput.value = '';
    const imageManager = document.getElementById('product-images-manager');
    if (imageManager) imageManager.innerHTML = '<p class="text-xs text-slate-400">Guarda el producto para gestionar la galeria.</p>';
    renderProductUploadPreview([]);
    setProductUploadProgress({ active: false, message: 'Sin tareas pendientes.' });
    void populateProductCategorySelect('');
  }
  if (activeView === 'settings') {
    renderOgImagesList();
    renderTwitterImagePreview();
    renderHreflangList();
    applyGoogle2026SwitchState();
    applySeoImagesSwitchState();
    applyTechFilesSwitchState();
  }
  formEl.querySelectorAll('[data-length-target]').forEach((input) => {
    updateLengthHint(input);
  });
  showMessage('Formulario limpio.');
  if (formTitle) {
    formTitle.textContent = cfg.singleton ? 'Configuracion global' : `Nuevo ${cfg.title}`;
  }
}

function setSettingsInlineMode(enabled) {
  const next = Boolean(enabled);
  if (next === settingsInlineMode) return;
  settingsInlineMode = next;

  if (settingsInlineMode) {
    formBackdrop.classList.add('hidden');
    if (panelMain && formOffcanvas.parentElement !== panelMain) {
      panelMain.appendChild(formOffcanvas);
    }
    if (crudSection) {
      crudSection.classList.add('hidden');
    }
    if (closeFormBtn) {
      closeFormBtn.classList.add('hidden');
    }

    formOffcanvas.classList.remove('fixed', 'inset-y-0', 'right-0', 'z-40', 'max-w-xl', 'translate-x-full', 'border-l', 'shadow-2xl');
    formOffcanvas.classList.add('relative', 'w-full', 'max-w-none', 'rounded-2xl', 'border', 'border-white/10', 'bg-slate-900/75');
    formOffcanvas.style.transform = 'none';
    formOffcanvas.style.maxHeight = 'none';
    formOffcanvas.style.height = 'auto';
    return;
  }

  if (defaultFormParent && formOffcanvas.parentElement !== defaultFormParent) {
    defaultFormParent.appendChild(formOffcanvas);
  }
  if (crudSection) {
    crudSection.classList.remove('hidden');
  }
  if (closeFormBtn) {
    closeFormBtn.classList.remove('hidden');
  }

  formOffcanvas.classList.remove('relative', 'max-w-none', 'rounded-2xl', 'border');
  formOffcanvas.classList.add('fixed', 'inset-y-0', 'right-0', 'z-40', 'max-w-xl', 'translate-x-full', 'border-l', 'shadow-2xl');
  formOffcanvas.style.transform = '';
  formOffcanvas.style.maxHeight = '';
  formOffcanvas.style.height = '';
}

function openForm() {
  if (settingsInlineMode) return;
  formOffcanvas.classList.remove('translate-x-full');
  formBackdrop.classList.remove('hidden');
}

function closeForm() {
  if (settingsInlineMode) {
    formBackdrop.classList.add('hidden');
    return;
  }
  formOffcanvas.classList.add('translate-x-full');
  formBackdrop.classList.add('hidden');
}

async function requestJson(url, options = {}) {
  const token = getAuthToken();
  if (!token) {
    window.location.replace('/panel/login.html');
    return null;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Error de API.');
  return data;
}

async function renderRows() {
  const cfg = getConfig();
  const rows = await requestJson(`${API_BASE}/${cfg.endpoint}`);
  if (!rows) return [];

  bodyEl.innerHTML = rows
    .map((row) => {
      const dataCols = cfg.columns.map((col) => `<td class="border-b border-white/10 px-3 py-2">${row[col] ?? ''}</td>`).join('');
      const actionButtons = cfg.singleton
        ? `<button data-edit="${row[cfg.idKey]}" class="rounded-lg border border-white/20 px-2 py-1 text-xs">Editar</button>`
        : `
              <button data-edit="${row[cfg.idKey]}" class="rounded-lg border border-white/20 px-2 py-1 text-xs">Editar</button>
              <button data-delete="${row[cfg.idKey]}" class="rounded-lg border border-rose-400/40 px-2 py-1 text-xs text-rose-300">Borrar</button>
            `;
      return `
        <tr class="text-slate-200">
          ${dataCols}
          <td class="border-b border-white/10 px-3 py-2">
            <div class="flex gap-2">
              ${actionButtons}
            </div>
          </td>
        </tr>
      `;
    })
    .join('');

  bodyEl.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.edit);
      const row = rows.find((r) => Number(r[cfg.idKey]) === id);
      if (!row) return;
      editingId = id;
      fillForm(row);
      if (formTitle) formTitle.textContent = cfg.singleton ? 'Configuracion global' : `Editar ${cfg.title}`;
      if (!settingsInlineMode) {
        openForm();
      }
      showMessage(`Editando ID ${id}`);
    });
  });

  if (!cfg.singleton) {
    bodyEl.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.dataset.delete);
        if (!confirm(`Eliminar registro ${id}?`)) return;
        try {
          await requestJson(`${API_BASE}/${cfg.endpoint}/${id}`, { method: 'DELETE' });
          await renderRows();
          showMessage(`Registro ${id} eliminado.`);
        } catch (error) {
          showMessage(error.message, true);
        }
      });
    });
  }

  return rows;
}

async function saveItem() {
  const cfg = getConfig();
  const payload = {};

  cfg.fields.forEach((field) => {
    const input = formEl.elements.namedItem(field.key);
    if (field.type === 'file' || field.type === 'file-multiple' || field.type === 'section') return;
    payload[field.key] = getFieldValue(field, input);
  });

  if (activeView === 'products' && !editingId && productUploadFiles.length && !String(payload.imageUrl || '').trim()) {
    payload.imageUrl = '/uploads/pending-product-image.jpg';
  }

  try {
    const saveBtnLabel = saveBtn ? saveBtn.textContent : '';
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Guardando...';
    }

    let saved = null;
    let targetId = editingId;

    if (cfg.singleton) {
      const singletonId = Number.isInteger(Number(editingId)) && Number(editingId) > 0 ? Number(editingId) : 1;
      saved = await requestJson(`${API_BASE}/${cfg.endpoint}/${singletonId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      editingId = singletonId;
      if (saved) fillForm(saved);
      showMessage('Configuracion actualizada.');
      await renderRows();
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = saveBtnLabel || 'Guardar';
      }
      return;
    }

    if (editingId) {
      saved = await requestJson(`${API_BASE}/${cfg.endpoint}/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      showMessage(`Registro ${editingId} actualizado.`);
    } else {
      saved = await requestJson(`${API_BASE}/${cfg.endpoint}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showMessage('Registro creado.');
      if (saved && Number.isInteger(Number(saved.id))) {
        targetId = Number(saved.id);
      }
    }

    if (activeView === 'products' && Number.isInteger(Number(targetId)) && Number(targetId) > 0 && productUploadFiles.length) {
      const uploadResult = await processPendingProductImages(Number(targetId));
      if (uploadResult.created > 0) {
        showMessage(`Producto guardado. Se subieron ${uploadResult.created} imagen(es).`);
      }
    }

    clearForm();
    await renderRows();
    closeForm();
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = saveBtnLabel || 'Guardar';
    }
  } catch (error) {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Guardar';
    }
    setProductUploadProgress({ active: false, message: 'Error durante la subida.' });
    showMessage(error.message, true);
  }
}

function activateNav() {
  navRoot.querySelectorAll('[data-view]').forEach((btn) => {
    const active = btn.dataset.view === activeView;
    btn.classList.toggle('bg-sky-500/25', active);
    btn.classList.toggle('border-sky-300/60', active);
  });
}

async function switchView(nextView) {
  if (!viewConfig[nextView]) return;
  activeView = nextView;
  editingId = null;
  activeFormTab = null;

  const url = new URL(window.location.href);
  url.searchParams.set('view', activeView);
  window.history.replaceState({}, '', `${url.pathname}?${url.searchParams.toString()}`);

  const cfg = getConfig();
  setSettingsInlineMode(Boolean(cfg.singleton));
  viewTitle.textContent = cfg.title;
  newBtn.classList.toggle('hidden', Boolean(cfg.singleton));
  if (formTitle) {
    formTitle.textContent = cfg.singleton ? 'Configuracion global' : `Nuevo ${cfg.title}`;
  }
  renderForm();
  renderTableHead();
  activateNav();
  const rows = await renderRows();

  if (cfg.singleton && Array.isArray(rows) && rows.length) {
    const first = rows[0];
    const singletonId = Number(first[cfg.idKey]);
    if (Number.isInteger(singletonId) && singletonId > 0) {
      editingId = singletonId;
    }
    fillForm(first);
    if (formTitle) formTitle.textContent = 'Configuracion global';
    if (!settingsInlineMode) {
      openForm();
    }
    showMessage('Configuracion cargada.');
  }
}

async function setupLayoutParts() {
  topbarRoot.innerHTML = await loadPart('/panel/parts/topbar.html');
  navRoot.innerHTML = await loadPart('/panel/parts/nav.html');

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('panel_user');
      window.location.replace('/panel/login.html');
    });
  }

  navRoot.querySelectorAll('[data-view]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await switchView(btn.dataset.view);
    });
  });
}

async function bootstrap() {
  await setupLayoutParts();
  await switchView(getInitialPanelView());

  saveBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    await saveItem();
  });

  clearBtn.addEventListener('click', () => clearForm());
  newBtn.addEventListener('click', () => {
    clearForm();
    openForm();
  });
  closeFormBtn.addEventListener('click', () => closeForm());
  formBackdrop.addEventListener('click', () => closeForm());
  refreshBtn.addEventListener('click', async () => {
    const rows = await renderRows();
    const cfg = getConfig();
    if (cfg.singleton && Array.isArray(rows) && rows.length) {
      const first = rows[0];
      const singletonId = Number(first[cfg.idKey]);
      if (Number.isInteger(singletonId) && singletonId > 0) {
        editingId = singletonId;
      }
      fillForm(first);
    }
    showMessage('Datos recargados.');
  });
}

bootstrap().catch((error) => {
  showMessage(error.message, true);
});
