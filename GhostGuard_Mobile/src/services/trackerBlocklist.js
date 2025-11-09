// Comprehensive list of known tracking, analytics, and advertising domains
const trackers = [
  // Google trackers
  'doubleclick.net', 'google-analytics.com', 'googletagmanager.com', 'googlesyndication.com',
  'googleadservices.com', 'googletag.com', 'analytics.google.com',
  
  // Facebook/Meta trackers
  'facebook.net', 'facebook.com', 'connect.facebook.net', 'fbcdn.net',
  
  // Ad networks
  'adnxs.com', 'adsrvr.org', 'adform.net', 'advertising.com', 'criteo.com', 'criteo.net',
  'pubmatic.com', 'rubiconproject.com', 'openx.net', 'casalemedia.com', 'contextweb.com',
  'advertising.com', 'turn.com', 'admob.com', 'inmobi.com', 'flurry.com',
  
  // Content recommendation
  'taboola.com', 'outbrain.com', 'revcontent.com', 'mgid.com',
  
  // Analytics & metrics
  'scorecardresearch.com', 'quantserve.com', 'quantcount.com', 'comscore.com',
  'mixpanel.com', 'segment.com', 'segment.io', 'amplitude.com', 'hotjar.com',
  'fullstory.com', 'mouseflow.com', 'crazyegg.com', 'inspectlet.com',
  
  // Social media trackers
  'twitter.com', 'pinterest.com', 'linkedin.com', 'instagram.com',
  
  // CDN trackers
  'cloudflare.com', 'akamaihd.net', 'cloudfront.net',
  
  // Fingerprinting & tracking services
  'fingerprintjs.com', 'browserleaks.com', 'maxmind.com',
  
  // Ad exchanges
  'appnexus.com', 'indexww.com', 'smartadserver.com', 'improvedigital.com',
  
  // Retargeting
  'rlcdn.com', 'adroll.com', 'perfectaudience.com',
  
  // Other trackers
  'branch.io', 'adjust.com', 'appsflyer.com', 'kochava.com', 'tune.com'
];

export function isTrackerDomain(url) {
  try {
    const { hostname } = new URL(url);
    return trackers.some(d => hostname.endsWith(d) || hostname.includes(d));
  } catch {
    return false;
  }
}


