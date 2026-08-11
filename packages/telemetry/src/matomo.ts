import MatomoTracker from '@jonkoops/matomo-tracker';

export let MatomoInstance: MatomoTracker | null = null;

export interface MatomoInitOptions {
  isAllowed: boolean;
  urlBase?: string;
  siteId?: number;
}

export function initMatomoTracker(options: MatomoInitOptions) {
  if (options.isAllowed && options.urlBase && options.siteId) {
    MatomoInstance = new MatomoTracker({
      urlBase: options.urlBase,
      siteId: options.siteId,
    });
  }
}
