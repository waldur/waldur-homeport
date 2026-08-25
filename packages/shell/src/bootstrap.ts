import {
  configureAuthCore,
  initApiClient,
  StorageAdapter,
} from 'waldur-auth-core';
import {
  applySidebarStyle,
  getInitialTheme,
  initBrandTokens,
  initFontFamily,
  resolveSidebarStyle,
  SidebarStyle,
} from 'waldur-design-tokens';
import {
  LanguageUtilsConfig,
  LanguageUtilsService,
  loadSharedLocale,
} from 'waldur-i18n-runtime';
import { fetchRuntimeConfig, RuntimeConfigData } from 'waldur-runtime-config';
import { initSentry, SentryInitOptions } from 'waldur-telemetry';

import { createSharedStorage } from './sharedStorage';
import {
  isConfiguredSidebarStyle,
  setConfiguredSidebarStyle,
} from './sidebarStyleConfig';

export interface AppShellSyncConfig {
  apiUrl: string;
  /** Defaults to a plain same-origin redirect to '/' — the correct handoff
   * for an app with no router of its own. Override for an app that has one. */
  onSessionExpired?: () => void;
  /** True once the backend's plugin config has loaded — see AuthCoreConfig's
   * own comment on why this must stay separate from isOidcAccessTokenEnabled.
   * Defaults to `() => true`: most micro-apps have no such gate. */
  isConfigLoaded?: () => boolean;
  isOidcAccessTokenEnabled?: () => boolean;
  defaultFontFamily?: string;
  /** Plain SidebarStyle, not ConfiguredSidebarStyle — 'auto' ("match
   * theme") can't be resolved yet at this point in bootstrap, before any
   * theme is known. bootstrapAppShellAsync() re-resolves 'auto' correctly
   * once the backend's real SIDEBAR_STYLE setting (which can be 'auto')
   * loads. */
  defaultSidebarStyle?: SidebarStyle;
}

/**
 * Call once, synchronously, at module load — before the app's first render,
 * not inside a useEffect. Two of these (initFontFamily/applySidebarStyle)
 * set CSS custom properties/attributes that tailwind.css and
 * surfaceColors.css read from first paint; an app that only ever set them
 * later, in an effect, would flash unstyled between mount and that effect
 * running. Mirrors waldur-homeport's own afterBootstrap.tsx sequencing.
 *
 * Returns the language storage adapter — the caller needs the same
 * instance again for bootstrapAppShellAsync()'s LanguageUtilsService.init().
 */
export function initAppShellSync(config: AppShellSyncConfig): {
  languageStorage: StorageAdapter;
} {
  const languageStorage = createSharedStorage('i18n/lang');

  configureAuthCore({
    storage: {
      token: createSharedStorage('auth/token'),
      method: createSharedStorage('auth/method'),
      impersonation: createSharedStorage('auth/impersonation'),
      language: languageStorage,
    },
    getApiEndpoint: () => config.apiUrl,
    isConfigLoaded: config.isConfigLoaded ?? (() => true),
    isOidcAccessTokenEnabled: config.isOidcAccessTokenEnabled ?? (() => false),
    onSessionExpired:
      config.onSessionExpired ??
      (() => {
        window.location.href = '/';
      }),
  });

  initApiClient();
  initFontFamily(config.defaultFontFamily ?? 'Inter');
  applySidebarStyle(config.defaultSidebarStyle ?? 'dark');

  return { languageStorage };
}

export interface AppShellAsyncConfig {
  /** The same instance initAppShellSync() returned. */
  languageStorage: StorageAdapter;
  defaultBrandColor: string;
  /** Defaults to waldur-i18n-runtime's loadSharedLocale() — the repo root's
   * shared locales/*.json catalogs, the same ones waldur-homeport's own
   * src/i18n loads. Override only for a micro-app with its own separate
   * translation catalogs. */
  loadLocale?: LanguageUtilsConfig['loadLocale'];
  /** Omit to skip Sentry entirely — not every micro-app has a DSN yet. */
  sentry?: SentryInitOptions;
}

/**
 * Call once, inside a useEffect (or equivalent) after the app mounts — this
 * half is genuinely async (a real network request) and, unlike
 * initAppShellSync(), nothing here needs to complete before first paint.
 * Silently keeps whatever initAppShellSync() already set as defaults on any
 * failure (no backend, not authenticated) — same fallback
 * waldur-homeport's own afterBootstrap.tsx uses.
 *
 * Returns the fetched config (or undefined on failure) so the caller can
 * layer any additional, app-specific plugin-config handling on top —
 * this function only applies the pieces every micro-app shares
 * (font/sidebar-style overrides, i18n, Sentry).
 */
export async function bootstrapAppShellAsync(
  config: AppShellAsyncConfig,
): Promise<RuntimeConfigData | undefined> {
  initBrandTokens(config.defaultBrandColor);

  let runtimeConfig: RuntimeConfigData | undefined;
  try {
    runtimeConfig = await fetchRuntimeConfig();

    const fontFamily = runtimeConfig.plugins?.WALDUR_CORE?.FONT_FAMILY;
    if (fontFamily) {
      initFontFamily(fontFamily);
    }

    const sidebarStyle = runtimeConfig.plugins?.WALDUR_CORE?.SIDEBAR_STYLE;
    if (sidebarStyle && isConfiguredSidebarStyle(sidebarStyle)) {
      setConfiguredSidebarStyle(sidebarStyle);
      applySidebarStyle(resolveSidebarStyle(sidebarStyle, getInitialTheme()));
    }

    LanguageUtilsService.init({
      languageChoices: runtimeConfig.languageChoices,
      defaultLanguage: runtimeConfig.defaultLanguage,
      loadLocale: config.loadLocale ?? loadSharedLocale,
      storage: config.languageStorage,
    });
    LanguageUtilsService.checkLanguage();
  } catch {
    // no backend / not authenticated — same silent fallback afterBootstrap.tsx uses
  }

  if (config.sentry) {
    initSentry(config.sentry);
  }

  return runtimeConfig;
}
