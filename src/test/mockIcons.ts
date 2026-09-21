import defaultHeroImage from '@/auth/estonian-bog.jpg';
import defaultMarketplaceHero from '@/dashboard/hero/marketplace-background.jpg';

/**
 * Fixture icons for Storybook, where the backend's /api/icons/<name>/ URLs
 * don't exist. Served by the @/core/api mock (src/core/__mocks__/api.ts).
 */

const BRAND_COLOR = '#307300';

// The Waldur mark, same path as src/images/logo_w.svg and packages/ui's
// WaldurLogo.
const WALDUR_LOGO_PATH =
  'm 2,10.04 v 7.98 h 1.98 v 2 H 0 v -9.98 z m 7.96,0 v 9.98 H 5.98 v -2 h 1.98 v -7.98 z m -3.98,3.98 v 4 h -2 v -4 z';

type LogoVariant = 'full' | 'mark' | 'powered-by';

const getLogoSvg = (variant: LogoVariant, dark = false): string => {
  if (variant === 'mark') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none">
  <rect width="64" height="64" rx="14" fill="${BRAND_COLOR}"/>
  <svg x="18" y="18" width="28" height="28" viewBox="0 10 10 10.02" fill="#FFFFFF">
    <path d="${WALDUR_LOGO_PATH}"/>
  </svg>
</svg>`;
  }
  if (variant === 'powered-by') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 44" width="170" height="44" fill="none">
  <rect x="2" y="2" width="40" height="40" rx="9" fill="${BRAND_COLOR}"/>
  <svg x="12" y="12" width="20" height="20" viewBox="0 10 10 10.02" fill="#FFFFFF">
    <path d="${WALDUR_LOGO_PATH}"/>
  </svg>
  <text x="52" y="29" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" letter-spacing="0.8" fill="#5E6278">WALDUR</text>
</svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" width="240" height="60" fill="none">
  <rect x="2" y="2" width="56" height="56" rx="12" fill="${BRAND_COLOR}"/>
  <svg x="16" y="16" width="28" height="28" viewBox="0 10 10 10.02" fill="#FFFFFF">
    <path d="${WALDUR_LOGO_PATH}"/>
  </svg>
  <text x="74" y="39" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="27" font-weight="800" letter-spacing="1" fill="${dark ? '#FFFFFF' : '#181C32'}">WALDUR</text>
</svg>`;
};

const getLogoDataUrl = (variant: LogoVariant, dark = false): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(getLogoSvg(variant, dark).trim())}`;

export const MOCK_ICON_URLS: Record<string, string> = {
  login_logo: getLogoDataUrl('full'),
  login_logo_dark: getLogoDataUrl('full', true),
  powered_by_logo: getLogoDataUrl('powered-by'),
  sidebar_logo: getLogoDataUrl('full'),
  sidebar_logo_dark: getLogoDataUrl('full', true),
  sidebar_logo_mobile: getLogoDataUrl('mark'),
  disclaimer_area_logo: getLogoDataUrl('mark'),
  hero_image: defaultHeroImage,
  marketplace_hero_image: defaultMarketplaceHero,
  call_management_hero_image: defaultMarketplaceHero,
};
