export {
  addApiErrorBreadcrumb,
  beforeBreadcrumb,
  initSentry,
  redactSensitive,
  sanitizeUrl,
  setSentryUser,
} from './sentry';
export type { SentryInitOptions } from './sentry';

// Re-exported so consumers (e.g. waldur-shell's error boundary) don't need
// their own direct @sentry/react dependency just to compose it — this
// package already owns that dependency for initSentry() etc. Works as an
// error boundary regardless of whether initSentry() was ever called (it
// only reports if the SDK is actually initialized; catching + rendering
// the fallback happens either way), so nothing needs to gate its use.
export { ErrorBoundary } from '@sentry/react';
export type { FallbackRender } from '@sentry/react';

export { initMatomoTracker, MatomoInstance } from './matomo';
export type { MatomoInitOptions } from './matomo';
