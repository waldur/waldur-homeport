export {
  addApiErrorBreadcrumb,
  beforeBreadcrumb,
  initSentry,
  redactSensitive,
  sanitizeUrl,
  setSentryUser,
} from './sentry';
export type { SentryInitOptions } from './sentry';

export { initMatomoTracker, MatomoInstance } from './matomo';
export type { MatomoInitOptions } from './matomo';
