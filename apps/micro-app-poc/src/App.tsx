import { useEffect } from 'react';
import { getApiUrlFromMeta } from 'waldur-runtime-config';
import { bootstrapAppShellAsync, initAppShellSync } from 'waldur-shell';

import { OrgDashboardMock } from './OrgDashboardMock';

// Set synchronously at module load, not inside an effect — see
// initAppShellSync()'s own comment on why this half can't wait for a
// useEffect. Same shared-storage-key/token-handoff-free reasoning as
// createSharedStorage() itself: a user already logged into the root app
// shouldn't have to log in again just because they're now on this subpath.
const { languageStorage } = initAppShellSync({
  apiUrl: getApiUrlFromMeta(),
  // Same-origin, so a plain redirect (not a router transition) is the
  // correct handoff to a real host's login — this app has none of its own.
  onSessionExpired: () => {
    window.location.href = '/';
  },
});

export const App = () => {
  // Light/dark theme is applied by OrgDashboardMock itself (via
  // waldur-shell's useShellTheme()) — it needs to live where the toggle
  // button does, and this shell has nothing else that depends on it.
  useEffect(() => {
    bootstrapAppShellAsync({
      languageStorage,
      defaultBrandColor: '#175CD3',
      // loadLocale omitted: defaults to waldur-i18n-runtime's
      // loadSharedLocale() — the same repo-root locales/*.json catalogs
      // waldur-homeport's own src/i18n loads. This app used to define its
      // own copy of that exact function (differing only in how many `../`
      // reached the repo root), the same duplication the main app's
      // src/i18n/LanguageUtilsService.ts independently had — see
      // loadSharedLocale.ts's own comment for why centralizing it needs no
      // Vite alias or app-specific config.
      sentry: {
        dsn: '',
        release: 'micro-app-poc@0.0.0',
        environment: 'development',
        tracePropagationTargets: [],
      },
    });
  }, []);

  return <OrgDashboardMock />;
};
