import { useEffect } from 'react';
import {
  configureAuthCore,
  initApiClient,
  StorageAdapter,
} from 'waldur-auth-core';
import {
  applySidebarStyle,
  ConfiguredSidebarStyle,
  getInitialTheme,
  initBrandTokens,
  initFontFamily,
  resolveSidebarStyle,
} from 'waldur-design-tokens';
import { LanguageUtilsService } from 'waldur-i18n-runtime';
import { fetchRuntimeConfig, getApiUrlFromMeta } from 'waldur-runtime-config';
import { initSentry } from 'waldur-telemetry';

import { OrgDashboardMock } from './OrgDashboardMock';
import { setConfiguredSidebarStyle } from './sidebarStyleConfig';

/**
 * Reads/writes the exact keys waldur-homeport's own
 * src/core/StorageManager.ts uses — NOT namespaced. A real dashboard
 * micro-app can't namespace its own auth storage the way an earlier version
 * of this file did: a user already logged into the root app shouldn't have
 * to log in again just because they're now on this subpath. Since both are
 * served from the same origin (see docs/micro-apps.md), reading the same
 * localStorage keys the root app already wrote to is enough — no token
 * hand-off needed.
 */
function createStorage(key: string): StorageAdapter {
  const sharedKey = `waldur/${key}`;
  return {
    get: () => localStorage.getItem(sharedKey),
    set: (next) => localStorage.setItem(sharedKey, next),
    remove: () => localStorage.removeItem(sharedKey),
  };
}

const apiUrl = getApiUrlFromMeta();
const languageStorage = createStorage('i18n/lang');

configureAuthCore({
  storage: {
    token: createStorage('auth/token'),
    method: createStorage('auth/method'),
    impersonation: createStorage('auth/impersonation'),
    language: languageStorage,
  },
  getApiEndpoint: () => apiUrl,
  isConfigLoaded: () => true,
  isOidcAccessTokenEnabled: () => false,
  // Same-origin, so a plain redirect (not a router transition) is the
  // correct handoff to a real host's login — this app has none of its own.
  onSessionExpired: () => {
    window.location.href = '/';
  },
});

initApiClient();

// Same locales/*.json files waldur-homeport's own src/i18n/LanguageUtilsService.ts
// imports (one extra `../` — this file sits one directory deeper). Not
// republished as a package: these are static translation-catalog data,
// not application code, so a relative reach-through here isn't the same
// kind of coupling this app otherwise avoids (no @/ aliases, no shared
// src/ components) — there's no backend endpoint that serves them
// instead (translate() is a pure client-side dictionary lookup, see
// waldur-i18n-runtime/src/translate.ts).
function getLocaleData(locale: string) {
  return import(`../../../locales/${locale}.json`);
}

// Set synchronously at module load, not inside an effect — App's first
// render already resolves tailwind.css's `--font-sans: var(--waldur-font-family), ...`,
// and an unset custom property there invalidates the whole font-family
// value (falls back to Tailwind's generic system-font stack, not just the
// next name in the list — see tailwind.css's comment). This guarantees
// it's never unset, with the real tenant value (if any) applied on top
// once fetchRuntimeConfig() resolves below.
initFontFamily('Inter');

const SIDEBAR_STYLES: readonly ConfiguredSidebarStyle[] = [
  'dark',
  'light',
  'primary',
  'accent',
  'accent-light',
  'auto',
];

function isConfiguredSidebarStyle(
  value: string,
): value is ConfiguredSidebarStyle {
  return (SIDEBAR_STYLES as readonly string[]).includes(value);
}

// Same synchronous-at-module-load reasoning as initFontFamily('Inter')
// above — surfaceColors.css's [data-sidebar-style] rules key off this
// attribute from first paint, and 'dark' is the same fallback
// src/navigation/sidebar/Sidebar.tsx's own `SIDEBAR_STYLE || 'dark'` uses.
applySidebarStyle('dark');

export const App = () => {
  // Light/dark theme is applied by OrgDashboardMock itself (see its own
  // useTheme effect there) — it needs to live where the toggle button
  // does, and this shell has nothing else that depends on it.
  useEffect(() => {
    initBrandTokens('#175CD3');

    // Same source as the main app's afterBootstrap.tsx's
    // initCssVariables() — a tenant-configurable ENV.plugins.WALDUR_CORE.
    // FONT_FAMILY. Silently keeps the 'Inter' default set above on any
    // failure (no backend, not authenticated) — same fallback afterBootstrap.tsx
    // itself uses (`|| 'Inter'`) when the plugin value is empty.
    fetchRuntimeConfig()
      .then((config) => {
        const fontFamily = config.plugins?.WALDUR_CORE?.FONT_FAMILY;
        if (fontFamily) {
          initFontFamily(fontFamily);
        }

        // Same tenant-configurable source as the main app's
        // src/navigation/sidebar/Sidebar.tsx. Validated against the known
        // variant list — SIDEBAR_STYLE is typed as a plain `string` in
        // src/auth/types.ts, not a union, so a stale/typo'd backend value
        // shouldn't set an attribute surfaceColors.css has no rule for
        // (which would fall through to the unstyled shadcn defaults).
        // getInitialTheme() re-reads current theme state, not a cached
        // page-load value, so this resolves correctly even if the user
        // toggled theme in the moment before this fetch resolved.
        const sidebarStyle = config.plugins?.WALDUR_CORE?.SIDEBAR_STYLE;
        if (sidebarStyle && isConfiguredSidebarStyle(sidebarStyle)) {
          setConfiguredSidebarStyle(sidebarStyle);
          applySidebarStyle(
            resolveSidebarStyle(sidebarStyle, getInitialTheme()),
          );
        }

        // Same wiring as the main app's own initLanguageUtils() — picks
        // up a language already chosen there via the shared
        // waldur/i18n/lang key (or the ?language= URL param, or the
        // backend's defaultLanguage), and loads that dictionary here too.
        // translate() calls below fall back to the raw English string
        // until this resolves, and forever if it never does (no
        // backend/not authenticated) — there's no untranslated flash to
        // avoid the way there was for font-family, since "untranslated"
        // and "the default state" are the same thing here.
        LanguageUtilsService.init({
          languageChoices: config.languageChoices,
          defaultLanguage: config.defaultLanguage,
          loadLocale: getLocaleData,
          storage: languageStorage,
        });
        LanguageUtilsService.checkLanguage();
      })
      .catch(() => {});

    initSentry({
      dsn: '',
      release: 'micro-app-poc@0.0.0',
      environment: 'development',
      tracePropagationTargets: [],
    });
  }, []);

  return <OrgDashboardMock />;
};
