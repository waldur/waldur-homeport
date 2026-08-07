import MatomoTracker from '@jonkoops/matomo-tracker';

import { getConsent } from '@/navigation/cookies/CookiesStorage';

import { ENV } from './config';

export let MatomoInstance: MatomoTracker = null;

export function initMatomoTracker() {
  const isAllowed = getConsent() === 'true';
  if (
    isAllowed &&
    ENV.plugins.WALDUR_CORE.MATOMO_URL_BASE &&
    ENV.plugins.WALDUR_CORE.MATOMO_SITE_ID
  )
    MatomoInstance = new MatomoTracker({
      urlBase: ENV.plugins.WALDUR_CORE.MATOMO_URL_BASE,
      siteId: ENV.plugins.WALDUR_CORE.MATOMO_SITE_ID,
    });
}
