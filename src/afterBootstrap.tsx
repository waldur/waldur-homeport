import MatomoTracker from '@jonkoops/matomo-tracker';
import * as Sentry from '@sentry/react';

import { ENV } from './core/config';
import { generateBrandColors, hexToRgb } from './core/generateColors';
import { LanguageUtilsService } from './i18n/LanguageUtilsService';
import { getConsent } from './navigation/cookies/CookiesStorage';
import { attachTransitions } from './transitions';

function initSentry() {
  if (ENV.plugins.WALDUR_CORE.HOMEPORT_SENTRY_DSN) {
    const { hostname } = new URL(ENV.apiEndpoint);
    Sentry.init({
      release: `waldur-homeport@${ENV.buildId}`,
      dsn: ENV.plugins.WALDUR_CORE.HOMEPORT_SENTRY_DSN,
      environment:
        ENV.plugins.WALDUR_CORE.HOMEPORT_SENTRY_ENVIRONMENT || 'unknown',
      tracesSampleRate:
        ENV.plugins.WALDUR_CORE.HOMEPORT_SENTRY_TRACES_SAMPLE_RATE || 0.2,
      tracePropagationTargets: [hostname, /^\//],
    });
  }
}

const generateCheckboxSvgUrl = (color) => {
  const svg = `<svg width='12' height='9' viewBox='0 0 12 9' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M11 1.25L4.125 8.125L1 5' stroke='${color}' stroke-width='1.6666' stroke-linecap='round' stroke-linejoin='round'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

const generateCheckboxIndeterminateSvgUrl = (color) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'><path fill='none' stroke='${color}' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M6 10h8'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

const generateRadioSvgUrl = (color) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'><circle r='2' fill='${color}'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

function initCssVariables() {
  const brand600 = ENV.plugins.WALDUR_CORE.BRAND_COLOR || '#307300';
  document.documentElement.style.setProperty('--waldur-brand-color', brand600);
  const brandRgb = hexToRgb(brand600);
  document.documentElement.style.setProperty(
    `--waldur-brand-color-rgb`,
    brandRgb,
  );

  const brandColors = generateBrandColors(brand600);

  Object.entries(brandColors).forEach(([key, color]) => {
    document.documentElement.style.setProperty(`--waldur-brand-${key}`, color);
  });

  // Generate checkbox & radio bg
  document.documentElement.style.setProperty(
    '--checkbox-bg',
    generateCheckboxSvgUrl(brand600),
  );
  document.documentElement.style.setProperty(
    '--checkbox-indeterminate-bg',
    generateCheckboxIndeterminateSvgUrl(brand600),
  );
  document.documentElement.style.setProperty(
    '--radio-bg',
    generateRadioSvgUrl(brand600),
  );
}

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

export function afterBootstrap() {
  document.title = ENV.plugins.WALDUR_CORE.FULL_PAGE_TITLE;
  initMatomoTracker();
  initSentry();
  LanguageUtilsService.checkLanguage();
  attachTransitions();
  initCssVariables();
}
