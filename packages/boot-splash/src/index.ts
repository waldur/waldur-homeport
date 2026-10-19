import { getIconUrl } from 'waldur-api-client';
import { DEFAULT_PRIMARY_COLORS } from 'waldur-design-tokens';

/**
 * Branding the boot splash paints before the configuration has loaded.
 *
 * The splash is on screen while the configuration that names the deployment
 * is still in flight, so it can only show what the previous visit saw. That
 * visit stores it here, and boot-splash.js reads the same key to paint the
 * first frame, before the application bundle has even downloaded. Every
 * Waldur app on the origin (the root app and its micro-apps) shares the key.
 * Keep the two readers in step: the key and the shape below are the contract.
 */
export const SPLASH_BRANDING_KEY = 'waldur/boot-splash';

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
  /**
   * What identifies the logo `logo` was made from (its URL and a hash of its
   * bytes), so an unchanged logo is not decoded and re-encoded on every boot.
   */
  logoSource?: string;
  /** The splash's text in the user's language, when the app translated it. */
  texts?: SplashTexts;
}

export interface SplashTexts {
  /** "Starting {name}…" */
  status: string;
  /** The notice shown when loading takes long. */
  slow: string;
  /** The notice's reload button. */
  reload: string;
}

/** The app's translate(), e.g. waldur-i18n-runtime's. */
export type Translate = (
  template: string,
  params?: Record<string, string>,
) => string;

export const DEFAULT_SPLASH_BRANDING: SplashBranding = {
  name: 'Waldur',
  color: DEFAULT_PRIMARY_COLORS[600],
  logo: null,
  disableDarkTheme: false,
};

/** The WALDUR_CORE settings the splash is branded from. */
export interface SplashCoreSettings {
  SHORT_PAGE_TITLE?: string;
  BRAND_COLOR?: string;
  SIDEBAR_LOGO_MOBILE?: string | null;
  DISABLE_DARK_THEME?: boolean;
}

// Stored data: URIs stay well within the storage quota.
const MAX_INLINE_LOGO_CHARS = 96 * 1024;
// Twice the splash's 56px logo slot (96px wide at most), for sharp HiDPI.
const LOGO_MAX_HEIGHT_PX = 112;
const LOGO_MAX_WIDTH_PX = 192;
const FADE_MS = 200;

const readAsDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

/** An image element for `blob`; one with no intrinsic size (some SVGs) can't be drawn. */
function loadImage(blob: Blob) {
  const url = URL.createObjectURL(blob);
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () =>
      image.naturalWidth && image.naturalHeight
        ? resolve(image)
        : reject(new Error('Image has no intrinsic size'));
    image.onerror = () => reject(new Error('Image failed to load'));
    image.src = url;
  }).finally(() => URL.revokeObjectURL(url));
}

/** An image drawn at the splash's display size, as a data: URI. */
async function downscale(blob: Blob) {
  const source: ImageBitmap | HTMLImageElement =
    blob.type === 'image/svg+xml'
      ? await loadImage(blob)
      : await createImageBitmap(blob);
  const width = 'naturalWidth' in source ? source.naturalWidth : source.width;
  const height =
    'naturalHeight' in source ? source.naturalHeight : source.height;
  const scale = Math.min(
    1,
    LOGO_MAX_HEIGHT_PX / height,
    LOGO_MAX_WIDTH_PX / width,
  );
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
  if ('close' in source) {
    source.close();
  }
  // Browsers without WebP encoding return PNG instead.
  return canvas.toDataURL('image/webp', 0.9);
}

type CachedLogo = Pick<SplashBranding, 'logo' | 'logoSource'>;

/**
 * What tells one logo from another: a hash of its bytes (cross-origin
 * responses don't expose ETag or Last-Modified to scripts), or just its size
 * where Web Crypto is unavailable (plain-http hosts other than localhost).
 */
async function fingerprint(blob: Blob) {
  if (!globalThis.crypto?.subtle) {
    return `size:${blob.size}`;
  }
  const digest = await crypto.subtle.digest(
    'SHA-256',
    await blob.arrayBuffer(),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}

/**
 * The logo at `url` as a small data: URI the splash can paint in its first
 * frame. Uploaded logos are often far larger than the mark they are shown as
 * (megabyte photos are not rare), so rasters, and SVGs too big to keep as
 * they are, are redrawn at display size.
 *
 * A logo that can't be made small gives null, so the splash shows the
 * default mark rather than an empty box while a URL downloads. A failed
 * request keeps the previously cached logo, and an unchanged logo is reused
 * as it is.
 */
async function inlineLogo(
  url: string,
  previous: CachedLogo,
): Promise<CachedLogo> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    return previous;
  }
  if (!response.ok) {
    return previous;
  }
  try {
    const blob = await response.blob();
    if (!blob.type.startsWith('image/')) {
      return { logo: null };
    }
    const logoSource = `${url}|${blob.type}|${await fingerprint(blob)}`;
    if (previous.logo && previous.logoSource === logoSource) {
      return previous;
    }
    let logo = blob.type === 'image/svg+xml' ? await readAsDataUrl(blob) : null;
    if (!logo || logo.length > MAX_INLINE_LOGO_CHARS) {
      logo = await downscale(blob);
    }
    return logo.length <= MAX_INLINE_LOGO_CHARS
      ? { logo, logoSource }
      : { logo: null };
  } catch {
    return { logo: null };
  }
}

/**
 * Caches the deployment's branding for the next visit's splash, in every
 * Waldur app on the origin. Call once the configuration has loaded, after the
 * API client is configured (the logo URL comes from waldur-api-client's
 * getIconUrl). Pass the app's `translate`, once the user's language has
 * loaded, to cache the splash's text in that language. Never rejects.
 */
export async function saveSplashBranding(
  core: SplashCoreSettings,
  { translate }: { translate?: Translate } = {},
) {
  try {
    const name = core.SHORT_PAGE_TITLE || DEFAULT_SPLASH_BRANDING.name;
    const branding: SplashBranding = {
      name,
      color: core.BRAND_COLOR || DEFAULT_SPLASH_BRANDING.color,
      logo: null,
      disableDarkTheme: Boolean(core.DISABLE_DARK_THEME),
    };
    if (translate) {
      branding.texts = {
        status: translate('Starting {name}…', { name }),
        slow: translate('Taking longer than usual. The server may be busy.'),
        reload: translate('Reload'),
      };
    }
    if (core.SIDEBAR_LOGO_MOBILE) {
      let url: string | undefined;
      try {
        url = getIconUrl('sidebar_logo_mobile');
      } catch {
        // API client not configured: cache the rest without a logo.
      }
      if (url) {
        Object.assign(branding, await inlineLogo(url, readSplashBranding()));
      }
    }
    localStorage.setItem(SPLASH_BRANDING_KEY, JSON.stringify(branding));
  } catch {
    // Storage may be full or blocked; the next visit just shows the default.
  }
}

// Only a hex colour can seed the brand ramp (initBrandTokens parses it).
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

function readTexts(texts: unknown): SplashTexts | undefined {
  if (!texts || typeof texts !== 'object') {
    return undefined;
  }
  const { status, slow, reload } = texts as Record<string, unknown>;
  return typeof status === 'string' &&
    typeof slow === 'string' &&
    typeof reload === 'string'
    ? { status, slow, reload }
    : undefined;
}

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
        logoSource:
          typeof stored.logoSource === 'string' ? stored.logoSource : undefined,
        texts: readTexts(stored.texts),
      };
    }
  } catch {
    // Blocked storage or a malformed value: fall through to the default.
  }
  return DEFAULT_SPLASH_BRANDING;
}

/**
 * Removes the boot splash (#boot-splash), which stays outside the app from
 * the first paint on so it is never replaced or redrawn while the app loads
 * underneath it. With `fade`, it fades out first.
 */
export function dismissBootSplash({ fade = false } = {}) {
  const splash = document.getElementById('boot-splash');
  if (!splash) {
    return;
  }
  if (!fade) {
    splash.remove();
    return;
  }
  if (splash.hasAttribute('data-leaving')) {
    return;
  }
  splash.setAttribute('data-leaving', '');
  // A timer rather than transitionend, which never fires under reduced motion.
  setTimeout(() => splash.remove(), FADE_MS);
}
