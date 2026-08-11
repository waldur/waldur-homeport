import { initMatomoTracker as initMatomoTrackerCore } from 'waldur-telemetry';

import { getConsent } from '@/navigation/cookies/CookiesStorage';

import { ENV } from './config';

export { MatomoInstance } from 'waldur-telemetry';

export function initMatomoTracker() {
  initMatomoTrackerCore({
    isAllowed: getConsent() === 'true',
    urlBase: ENV.plugins.WALDUR_CORE.MATOMO_URL_BASE,
    siteId: ENV.plugins.WALDUR_CORE.MATOMO_SITE_ID,
  });
}
