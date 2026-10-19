import { DEFAULT_PRIMARY_COLORS } from 'waldur-design-tokens';

import { getIconUrl } from '@/core/api';
import { ENV } from '@/core/config';
import { getBrandColor } from '@/core/utils';

/**
 * Branding the boot splash paints before the configuration has loaded.
 *
 * The splash is on screen while the configuration that names the deployment
 * is still in flight, so it can only show what the previous visit saw. That
 * visit stores it here, and public/boot-splash.js reads the same key to paint
 * the first frame, before the application bundle has even downloaded. Keep
 * the two readers in step: the key and the shape below are the contract.
 */
export const SPLASH_BRANDING_KEY = 'waldur/boot-splash';

export const DEFAULT_SPLASH_BRANDING: SplashBranding = {
  name: 'Waldur',
  color: DEFAULT_PRIMARY_COLORS[600],
  logo: null,
  disableDarkTheme: false,
};

export interface SplashBranding {
  name: string;
  color: string;
  /**
   * The deployment's compact mark, as a data: URI so the splash can paint it
   * in its first frame (or its URL when it is too large to keep); null shows
   * the default Waldur mark.
   */
  logo: string | null;
  /** Whether dark theme is disabled for this deployment. */
  disableDarkTheme?: boolean;
}

// Stored data: URIs stay well within the storage quota.
const MAX_INLINE_LOGO_CHARS = 96 * 1024;
// Twice the splash's 56px logo slot (96px wide at most), for sharp HiDPI.
const LOGO_MAX_HEIGHT_PX = 112;
const LOGO_MAX_WIDTH_PX = 192;

const readAsDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

/** A raster image redrawn at the splash's display size, as a data: URI. */
async function downscale(blob: Blob) {
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(
    1,
    LOGO_MAX_HEIGHT_PX / bitmap.height,
    LOGO_MAX_WIDTH_PX / bitmap.width,
  );
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  // Browsers without WebP encoding return PNG instead.
  return canvas.toDataURL('image/webp', 0.9);
}

/**
 * The image at `url` as a small data: URI the splash can paint in its first
 * frame, or the URL itself if it can't be. Uploaded logos are often far
 * larger than the mark they are shown as (megabyte photos are not rare), so
 * rasters are redrawn at display size; SVGs are kept as they are.
 */
async function inlineImage(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return url;
    }
    const blob = await response.blob();
    if (!blob.type.startsWith('image/')) {
      return url;
    }
    const data =
      blob.type === 'image/svg+xml'
        ? await readAsDataUrl(blob)
        : await downscale(blob);
    return data.length <= MAX_INLINE_LOGO_CHARS ? data : url;
  } catch {
    return url;
  }
}

export async function saveSplashBranding() {
  const core = ENV.plugins?.WALDUR_CORE;
  if (!core) {
    return;
  }
  const branding: SplashBranding = {
    name: core.SHORT_PAGE_TITLE || DEFAULT_SPLASH_BRANDING.name,
    color: getBrandColor(),
    logo: core.SIDEBAR_LOGO_MOBILE
      ? await inlineImage(getIconUrl('sidebar_logo_mobile'))
      : null,
    disableDarkTheme: Boolean(core.DISABLE_DARK_THEME),
  };
  try {
    localStorage.setItem(SPLASH_BRANDING_KEY, JSON.stringify(branding));
  } catch {
    // Storage may be full or blocked; the next visit just shows the default.
  }
}

// Only a hex colour can seed the brand ramp (initBrandTokens parses it).
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export function readSplashBranding(): SplashBranding {
  try {
    const stored = JSON.parse(localStorage.getItem(SPLASH_BRANDING_KEY));
    if (stored && typeof stored === 'object') {
      return {
        name:
          typeof stored.name === 'string' && stored.name
            ? stored.name
            : DEFAULT_SPLASH_BRANDING.name,
        color:
          typeof stored.color === 'string' && HEX_COLOR.test(stored.color)
            ? stored.color
            : DEFAULT_SPLASH_BRANDING.color,
        logo: typeof stored.logo === 'string' ? stored.logo : null,
        disableDarkTheme: Boolean(stored.disableDarkTheme),
      };
    }
  } catch {
    // Blocked storage or a malformed value: fall through to the default.
  }
  return DEFAULT_SPLASH_BRANDING;
}
