import { initBrandTokens } from 'waldur-design-tokens';

import { ENV } from './core/config';
import { initMatomoTracker } from './core/matomo';
import { initSentry } from './core/sentry';
import { saveSplashBranding } from './core/splashBranding';
import { getBrandColor } from './core/utils';
import {
  initLanguageUtils,
  LanguageUtilsService,
} from './i18n/LanguageUtilsService';
import { attachTransitions } from './transitions';

function initCssVariables() {
  initBrandTokens(getBrandColor());

  // Font family
  const fontFamily = ENV.plugins.WALDUR_CORE.FONT_FAMILY || 'Inter';
  document.documentElement.style.setProperty(
    '--font-family',
    `${fontFamily}, Helvetica, sans-serif`,
  );
  const fontSizeAdjust: Record<string, number> = {
    'Maven Pro': 1.08,
  };
  document.documentElement.style.setProperty(
    '--font-size-adjust',
    String(fontSizeAdjust[fontFamily] ?? 1),
  );
}

function initPageTitle() {
  document.title = ENV.plugins.WALDUR_CORE.FULL_PAGE_TITLE;
}

function initI18n() {
  initLanguageUtils();
  LanguageUtilsService.checkLanguage();
}

/**
 * Composes the init* steps above in order. Split out so each concern
 * (analytics, error tracking, i18n, router transitions, brand CSS
 * variables) can be reasoned about and changed independently, and so a
 * future standalone auth app has a clear, small set of steps to copy
 * rather than one monolithic function to pick apart.
 */
export function afterBootstrap() {
  initPageTitle();
  initMatomoTracker();
  initSentry();
  initI18n();
  attachTransitions();
  initCssVariables();
  // Fire and forget: only the next visit's splash depends on it.
  void saveSplashBranding();
}
