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
import {
  fetchRuntimeConfig,
  getApiUrlFromMeta,
  RuntimeConfigData,
} from 'waldur-runtime-config';
import { initSentry, SentryInitOptions } from 'waldur-telemetry';

import { createSharedStorage } from './sharedStorage';
import {
  isConfiguredSidebarStyle,
  setConfiguredSidebarStyle,
} from './sidebarStyleConfig';

// The backend's own real default (src/SettingsDescription.ts's BRAND_COLOR
// setting) — not an arbitrary placeholder. A micro-app that never
// overrides defaultBrandColor renders with the same default a fresh,
// unconfigured Waldur deployment would.
const DEFAULT_BRAND_COLOR = '#307300';

export interface MicroAppBootstrapConfig {
  /** Defaults to getApiUrlFromMeta() (the page's own `<meta name="api-url">`)
   * — every micro-app reads this the same way, so there's rarely a reason
   * to override it. */
  apiUrl?: string;
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
   * theme") can't be resolved yet this early, before any theme is known;
   * it's correctly re-resolved once the backend's real SIDEBAR_STYLE
   * setting (which can be 'auto') loads. */
  defaultSidebarStyle?: SidebarStyle;
  /** Defaults to the backend's own real BRAND_COLOR default — see
   * DEFAULT_BRAND_COLOR's own comment. Re-applied automatically once the
   * tenant's real BRAND_COLOR loads, same as FONT_FAMILY/SIDEBAR_STYLE
   * below, so this is only ever the placeholder shown before that. */
  defaultBrandColor?: string;
  /** Defaults to waldur-i18n-runtime's loadSharedLocale() — the repo root's
   * shared locales/*.json catalogs, the same ones waldur-homeport's own
   * src/i18n loads. Override only for a micro-app with its own separate
   * translation catalogs. */
  loadLocale?: LanguageUtilsConfig['loadLocale'];
  /** Omit to skip Sentry entirely — not every micro-app has a DSN yet. An
   * empty dsn also disables Sentry (its own SDK's behavior), so there's no
   * need to pass this at all until a real DSN exists. */
  sentry?: SentryInitOptions;
}

/**
 * Bootstraps a micro-app's shared shell state in one call — auth/API
 * client config, font/brand/sidebar-style tokens, i18n, Sentry. Call once,
 * at module scope (not inside a component or effect): the synchronous
 * portion below runs to completion before this function returns, setting
 * CSS custom properties tailwind.css/surfaceColors.css read from first
 * paint (an app that only set them later, after mount, would flash
 * unstyled in between — mirrors waldur-homeport's own afterBootstrap.tsx
 * sequencing). The rest — fetching runtime config, refining those same
 * tokens with the tenant's real values, initializing i18n/Sentry — is
 * genuinely async (a real network request) and is kicked off before this
 * function returns without being awaited; nothing in it needs to complete
 * before first paint, so there's no need to stage it inside a component's
 * effect just to get "runs after the sync part" — module scope already
 * guarantees that ordering. The returned promise lets a caller that needs
 * the fetched config for its own app-specific plugin settings await it;
 * every value in MicroAppBootstrapConfig is optional, so a micro-app with
 * no special requirements can call this with no arguments at all.
 */
export function bootstrapMicroApp(
  config: MicroAppBootstrapConfig = {},
): Promise<RuntimeConfigData | undefined> {
  const languageStorage = createSharedStorage('i18n/lang');

  configureAuthCore({
    storage: {
      token: createSharedStorage('auth/token'),
      method: createSharedStorage('auth/method'),
      impersonation: createSharedStorage('auth/impersonation'),
      language: languageStorage,
    },
    getApiEndpoint: () => config.apiUrl ?? getApiUrlFromMeta(),
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
  initBrandTokens(config.defaultBrandColor ?? DEFAULT_BRAND_COLOR);

  return finishBootstrapAsync(languageStorage, config);
}

/**
 * Silently keeps whatever the sync half above already set as defaults on
 * any failure (no backend, not authenticated) — same fallback
 * waldur-homeport's own afterBootstrap.tsx uses.
 */
async function finishBootstrapAsync(
  languageStorage: StorageAdapter,
  config: MicroAppBootstrapConfig,
): Promise<RuntimeConfigData | undefined> {
  let runtimeConfig: RuntimeConfigData | undefined;
  try {
    runtimeConfig = await fetchRuntimeConfig();

    const fontFamily = runtimeConfig.plugins?.WALDUR_CORE?.FONT_FAMILY;
    if (fontFamily) {
      initFontFamily(fontFamily);
    }

    const brandColor = runtimeConfig.plugins?.WALDUR_CORE?.BRAND_COLOR;
    if (brandColor) {
      initBrandTokens(brandColor);
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
      storage: languageStorage,
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
