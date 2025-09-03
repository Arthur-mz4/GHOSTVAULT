const trackers = [
  'doubleclick.net', 'google-analytics.com', 'googletagmanager.com', 'facebook.net',
  'adnxs.com', 'taboola.com', 'outbrain.com', 'scorecardresearch.com', 'quantserve.com'
];
export function isTrackerDomain(url) { try { const { hostname } = new URL(url); return trackers.some(d => hostname.endsWith(d)); } catch { return false; } }


