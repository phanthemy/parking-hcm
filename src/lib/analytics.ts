// Lightweight Driver Journey Funnel Tracker

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  let sid = localStorage.getItem('mapgo_session_id');
  if (!sid) {
    sid = 'sid_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    localStorage.setItem('mapgo_session_id', sid);
  }
  return sid;
}

export function trackEvent(
  eventName: 
    | 'home_opened'
    | 'gps_granted'
    | 'quick_assist_shown'
    | 'nearby_clicked'
    | 'navigation_started'
    | 'spot_detail_opened'
    | 'spot_called'
    | 'spot_favorited'
    | 'spot_reported'
    | 'pwa_installed'
    | 'pwa_banner_shown'
    | 'pwa_install_click'
    | 'pwa_install_accepted'
    | 'pwa_banner_dismissed'
    | 'pwa_direct_launch',
  payload: {
    spot_id?: string;
    category?: string;
    metadata?: Record<string, any>;
  } = {}
) {
  if (typeof window === 'undefined') return;

  const data = {
    event_name: eventName,
    session_id: getSessionId(),
    spot_id: payload.spot_id,
    category: payload.category,
    metadata: payload.metadata || {}
  };

  // Use sendBeacon if available for non-blocking telemetry
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/track', JSON.stringify(data));
  } else {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      keepalive: true,
    }).catch(() => {});
  }
}
