function sanitizeGa4Id(raw) {
  const value = String(raw || '')
    .trim()
    .toUpperCase();
  const match = value.match(/\bG-[A-Z0-9]{4,20}\b/);
  return match ? match[0] : '';
}

function sanitizeClarityId(raw) {
  const value = String(raw || '').trim();
  return /^[a-z0-9]{6,20}$/i.test(value) ? value : '';
}

function sanitizeUetId(raw) {
  const value = String(raw || '').trim();
  return /^[0-9]{3,20}$/.test(value) ? value : '';
}

function sanitizeMetaPixelId(raw) {
  const value = String(raw || '').trim();
  return /^[0-9]{6,20}$/.test(value) ? value : '';
}

function buildGoogleAnalyticsTag(gaId) {
  if (!gaId) return '';
  return [
    `<script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>`,
    '<script>',
    '  window.dataLayer = window.dataLayer || [];',
    '  function gtag(){dataLayer.push(arguments);}',
    '  gtag("js", new Date());',
    `  gtag("config", "${gaId}");`,
    '</script>'
  ].join('\n');
}

function buildMicrosoftClarityTag(clarityId) {
  if (!clarityId) return '';
  return [
    '<script>',
    '  (function(c,l,a,r,i,t,y){',
    '      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};',
    '      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;',
    '      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);',
    `  })(window, document, "clarity", "script", "${clarityId}");`,
    '</script>'
  ].join('\n');
}

function buildMicrosoftUetTag(uetId) {
  if (!uetId) return '';
  return [
    '<script>',
    '  (function(w,d,t,r,u){',
    '    var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:"'+ uetId +'"};o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")},',
    '    n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){',
    '      var s=this.readyState;s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)',
    '    },i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)',
    '  })(window,document,"script","//bat.bing.com/bat.js","uetq");',
    '</script>'
  ].join('\n');
}

function buildMetaPixelTag(pixelId) {
  if (!pixelId) return '';
  return [
    '<script>',
    '  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?',
    '  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;',
    '  n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;',
    '  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,"script",',
    '  "https://connect.facebook.net/en_US/fbevents.js");',
    `  fbq("init", "${pixelId}");`,
    '  fbq("track", "PageView");',
    '</script>',
    `<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/></noscript>`
  ].join('\n');
}

function buildTrackingTags(settings = {}, env = process.env) {
  const ga4Id = sanitizeGa4Id(
    settings?.trackingGoogleAnalyticsId ||
    settings?.templateGoogleAnalyticsId ||
    env.GOOGLE_ANALYTICS_ID ||
    env.GA4_ID
  );
  const clarityId = sanitizeClarityId(
    settings?.trackingMicrosoftClarityId ||
    env.MICROSOFT_CLARITY_ID ||
    env.CLARITY_ID
  );
  const uetId = sanitizeUetId(
    settings?.trackingMicrosoftUetId ||
    env.MICROSOFT_UET_ID ||
    env.BING_UET_ID
  );
  const metaPixelId = sanitizeMetaPixelId(
    settings?.trackingMetaPixelId ||
    env.META_PIXEL_ID ||
    env.FACEBOOK_PIXEL_ID
  );

  return [
    buildGoogleAnalyticsTag(ga4Id),
    buildMicrosoftClarityTag(clarityId),
    buildMicrosoftUetTag(uetId),
    buildMetaPixelTag(metaPixelId)
  ]
    .filter(Boolean)
    .join('\n');
}

module.exports = {
  buildTrackingTags
};
