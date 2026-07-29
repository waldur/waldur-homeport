import { ENV } from '@/core/config';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';

// Gated on a backend feature flag (false by default). Resolves synchronously
// from config loaded before first render, so the branch is stable for the
// app's lifetime.
export const isRealtimeEnabled = (): boolean =>
  isFeatureVisible(MarketplaceFeatures.realtime_updates);

// Always derived from the API endpoint — deliberately NOT configurable from
// the client side: the STOMP CONNECT carries the user's auth token as
// passcode, so client-writable storage must never choose where it is sent.
// Dev serves the same /rmqws-stomp path via the Vite proxy (vite.config.ts);
// production exposes it on the API host via Caddy/ingress.
export const getBrokerUrl = (): string => {
  // apiEndpoint may be relative ("/" in dev, where the SPA calls the API
  // same-origin through the Vite proxy) — resolve against the page origin.
  const api = new URL(ENV.apiEndpoint, window.location.origin);
  const protocol = api.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${api.host}/rmqws-stomp`;
};
