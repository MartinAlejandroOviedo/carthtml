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

module.exports = {
  buildSeoModulesFromSettings,
  hasEnabledSeoModules,
  buildSeoDefaultsFromSettings
};
