import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';

import {
  DEFAULT_SPLASH_BRANDING,
  readSplashBranding,
  saveSplashBranding,
  SPLASH_BRANDING_KEY,
} from './splashBranding';

vi.mock('@/core/api', () => ({
  getIconUrl: (name: string) => `https://api.example.org/api/icons/${name}/`,
}));

describe('splash branding cache', () => {
  beforeEach(() => {
    localStorage.clear();
    ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE = 'Campus Cloud';
    ENV.plugins.WALDUR_CORE.BRAND_COLOR = '#7a3fcf';
    ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO_MOBILE = undefined;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const serveLogo = (body: BlobPart, type = 'image/svg+xml', ok = true) =>
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok,
        blob: () => Promise.resolve(new Blob([body], { type })),
      }),
    );

  it('falls back to the Waldur defaults on a first visit', () => {
    expect(readSplashBranding()).toEqual(DEFAULT_SPLASH_BRANDING);
  });

  it('round-trips the deployment name and brand colour', async () => {
    await saveSplashBranding();
    expect(readSplashBranding()).toEqual({
      name: 'Campus Cloud',
      color: '#7a3fcf',
      logo: null,
      disableDarkTheme: false,
    });
  });

  it('persists when dark theme is disabled', async () => {
    ENV.plugins.WALDUR_CORE.DISABLE_DARK_THEME = true;
    await saveSplashBranding();
    expect(readSplashBranding().disableDarkTheme).toBe(true);
  });

  it('keeps the compact logo inline so the splash paints it at once', async () => {
    ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO_MOBILE = 'logo-mobile.svg';
    serveLogo('<svg/>');
    await saveSplashBranding();
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.org/api/icons/sidebar_logo_mobile/',
    );
    expect(readSplashBranding().logo).toMatch(/^data:image\/svg\+xml;base64,/);
  });

  it('redraws a large raster logo at the size the splash shows it', async () => {
    ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO_MOBILE = 'logo-mobile.jpg';
    serveLogo(new Uint8Array(1024), 'image/jpeg');
    const close = vi.fn();
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockResolvedValue({ width: 2000, height: 1000, close }),
    );
    const drawImage = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage,
    } as any);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
      'data:image/webp;base64,AAAA',
    );

    await saveSplashBranding();

    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 192, 96);
    expect(close).toHaveBeenCalled();
    expect(readSplashBranding().logo).toBe('data:image/webp;base64,AAAA');
  });

  it('keeps a logo too large to inline as its URL', async () => {
    ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO_MOBILE = 'logo-mobile.svg';
    serveLogo(`<svg>${'x'.repeat(100 * 1024)}</svg>`);
    await saveSplashBranding();
    expect(readSplashBranding().logo).toBe(
      'https://api.example.org/api/icons/sidebar_logo_mobile/',
    );
  });

  it('keeps the logo URL when it cannot be fetched', async () => {
    ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO_MOBILE = 'logo-mobile.png';
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    await saveSplashBranding();
    expect(readSplashBranding().logo).toBe(
      'https://api.example.org/api/icons/sidebar_logo_mobile/',
    );
  });

  it('does not inline a response that is not an image', async () => {
    ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO_MOBILE = 'logo-mobile.png';
    serveLogo('<html></html>', 'text/html');
    await saveSplashBranding();
    expect(readSplashBranding().logo).toBe(
      'https://api.example.org/api/icons/sidebar_logo_mobile/',
    );
  });

  it('ignores a malformed stored value', () => {
    localStorage.setItem(SPLASH_BRANDING_KEY, '{not json');
    expect(readSplashBranding()).toEqual(DEFAULT_SPLASH_BRANDING);
  });

  it('fills in missing or mistyped fields from the defaults', () => {
    localStorage.setItem(
      SPLASH_BRANDING_KEY,
      JSON.stringify({ name: '', color: 'red; x: y', logo: {} }),
    );
    expect(readSplashBranding()).toEqual(DEFAULT_SPLASH_BRANDING);
  });

  it('does not throw when storage is unavailable', async () => {
    const spy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
    await expect(saveSplashBranding()).resolves.toBeUndefined();
    spy.mockRestore();
  });
});
