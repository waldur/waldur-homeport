import { ENV } from './core/config';
import { generateBrandColors, hexToRgb } from './core/generateColors';
import { initMatomoTracker } from './core/matomo';
import { initSentry } from './core/sentry';
import { getBrandColor } from './core/utils';
import { LanguageUtilsService } from './i18n/LanguageUtilsService';
import { attachTransitions } from './transitions';

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
  const brand600 = getBrandColor();
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

  // Font family
  const fontFamily = ENV.plugins.WALDUR_CORE.FONT_FAMILY || 'Inter';
  document.documentElement.style.setProperty(
    '--waldur-font-family',
    `${fontFamily}, Helvetica, sans-serif`,
  );
  const fontSizeAdjust: Record<string, number> = {
    'Maven Pro': 1.08,
  };
  document.documentElement.style.setProperty(
    '--waldur-font-size-adjust',
    String(fontSizeAdjust[fontFamily] ?? 1),
  );

  // Generate checkbox & radio bg
  document.documentElement.style.setProperty(
    '--checkbox-bg',
    generateCheckboxSvgUrl('#fff'),
  );
  document.documentElement.style.setProperty(
    '--checkbox-indeterminate-bg',
    generateCheckboxIndeterminateSvgUrl('#fff'),
  );
  document.documentElement.style.setProperty(
    '--radio-bg',
    generateRadioSvgUrl('#fff'),
  );
}

function initPageTitle() {
  document.title = ENV.plugins.WALDUR_CORE.FULL_PAGE_TITLE;
}

function initI18n() {
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
}
