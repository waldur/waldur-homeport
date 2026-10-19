import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DEFAULT_SPLASH_BRANDING,
  dismissBootSplash,
  readSplashBranding,
  saveSplashBranding,
  SPLASH_BRANDING_KEY,
  SplashCoreSettings,
} from './index';

const getIconUrl = vi.fn(
  (name: string) => `https://api.example.org/api/icons/${name}/`,
);

vi.mock('waldur-api-client', () => ({
  getIconUrl: (name: string) => getIconUrl(name),
}));

describe('splash branding cache', () => {
  let core: SplashCoreSettings;

  beforeEach(() => {
    localStorage.clear();
    core = { SHORT_PAGE_TITLE: 'Campus Cloud', BRAND_COLOR: '#7a3fcf' };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const serveLogo = (
    body: BlobPart,
    type = 'image/svg+xml',
    { ok = true } = {},
  ) =>
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok,
          blob: () => Promise.resolve(new Blob([body], { type })),
        }),
      ),
    );

  // Canvas drawing, which jsdom lacks; returns what drawImage was called with.
  const stubCanvas = (dataUrl = 'data:image/webp;base64,AAAA') => {
    const drawImage = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage,
    } as any);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(dataUrl);
    return drawImage;
  };

  const stubBitmap = (width = 2000, height = 1000) => {
    const close = vi.fn();
    const create = vi.fn().mockResolvedValue({ width, height, close });
    vi.stubGlobal('createImageBitmap', create);
    return { create, close };
  };

  it('falls back to the Waldur defaults on a first visit', () => {
    expect(readSplashBranding()).toEqual(DEFAULT_SPLASH_BRANDING);
  });

  it('round-trips the deployment name and brand colour', async () => {
    await saveSplashBranding(core);
    expect(readSplashBranding()).toEqual({
      name: 'Campus Cloud',
      color: '#7a3fcf',
      logo: null,
      disableDarkTheme: false,
    });
  });

  it('persists when dark theme is disabled', async () => {
    core.DISABLE_DARK_THEME = true;
    await saveSplashBranding(core);
    expect(readSplashBranding().disableDarkTheme).toBe(true);
  });

  it('keeps the compact logo inline so the splash paints it at once', async () => {
    core.SIDEBAR_LOGO_MOBILE = 'logo-mobile.svg';
    serveLogo('<svg/>');
    await saveSplashBranding(core);
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.org/api/icons/sidebar_logo_mobile/',
    );
    expect(readSplashBranding().logo).toMatch(/^data:image\/svg\+xml;base64,/);
  });

  it('redraws a large raster logo at the size the splash shows it', async () => {
    core.SIDEBAR_LOGO_MOBILE = 'logo-mobile.jpg';
    serveLogo(new Uint8Array(1024), 'image/jpeg');
    const { close } = stubBitmap();
    const drawImage = stubCanvas();

    await saveSplashBranding(core);

    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 192, 96);
    expect(close).toHaveBeenCalled();
    expect(readSplashBranding().logo).toBe('data:image/webp;base64,AAAA');
  });

  it('redraws an SVG too large to keep as it is', async () => {
    core.SIDEBAR_LOGO_MOBILE = 'logo-mobile.svg';
    serveLogo(`<svg>${'x'.repeat(100 * 1024)}</svg>`);
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:logo'),
      revokeObjectURL: vi.fn(),
    });
    vi.stubGlobal(
      'Image',
      class {
        naturalWidth = 400;
        naturalHeight = 400;
        onload: () => void;
        set src(_: string) {
          setTimeout(() => this.onload());
        }
      },
    );
    const drawImage = stubCanvas();

    await saveSplashBranding(core);

    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 112, 112);
    expect(readSplashBranding().logo).toBe('data:image/webp;base64,AAAA');
  });

  it('falls back to the default mark when the logo stays too large', async () => {
    core.SIDEBAR_LOGO_MOBILE = 'logo-mobile.jpg';
    serveLogo(new Uint8Array(1024), 'image/jpeg');
    stubBitmap();
    stubCanvas(`data:image/webp;base64,${'A'.repeat(100 * 1024)}`);
    await saveSplashBranding(core);
    expect(readSplashBranding().logo).toBeNull();
  });

  it('does not keep a response that is not an image', async () => {
    core.SIDEBAR_LOGO_MOBILE = 'logo-mobile.png';
    serveLogo('<html></html>', 'text/html');
    await saveSplashBranding(core);
    expect(readSplashBranding().logo).toBeNull();
  });

  it('keeps the cached logo when the request fails', async () => {
    core.SIDEBAR_LOGO_MOBILE = 'logo-mobile.svg';
    serveLogo('<svg/>');
    await saveSplashBranding(core);
    const cached = readSplashBranding().logo;

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    await saveSplashBranding(core);
    expect(readSplashBranding().logo).toBe(cached);

    serveLogo('', 'text/html', { ok: false });
    await saveSplashBranding(core);
    expect(readSplashBranding().logo).toBe(cached);
  });

  it('does not redraw a logo that has not changed', async () => {
    core.SIDEBAR_LOGO_MOBILE = 'logo-mobile.jpg';
    serveLogo(new Uint8Array(1024), 'image/jpeg');
    const { create } = stubBitmap();
    stubCanvas();
    await saveSplashBranding(core);
    await saveSplashBranding(core);
    expect(create).toHaveBeenCalledOnce();

    serveLogo(new Uint8Array(1024).fill(1), 'image/jpeg');
    await saveSplashBranding(core);
    expect(create).toHaveBeenCalledTimes(2);
  });

  it('caches the rest when the logo URL is not available', async () => {
    core.SIDEBAR_LOGO_MOBILE = 'logo-mobile.png';
    getIconUrl.mockImplementationOnce(() => {
      throw new Error('configureApiClient() must be called');
    });
    await saveSplashBranding(core);
    expect(readSplashBranding()).toMatchObject({
      name: 'Campus Cloud',
      logo: null,
    });
  });

  it('caches the splash text in the user language', async () => {
    const translate = (template: string, params?: Record<string, string>) =>
      `[et] ${template.replace('{name}', params?.name ?? '')}`;
    await saveSplashBranding(core, { translate });
    expect(readSplashBranding().texts).toEqual({
      status: '[et] Starting Campus Cloud…',
      slow: '[et] Taking longer than usual. The server may be busy.',
      reload: '[et] Reload',
    });
  });

  it('ignores incomplete cached text', () => {
    localStorage.setItem(
      SPLASH_BRANDING_KEY,
      JSON.stringify({ name: 'X', texts: { status: 'only' } }),
    );
    expect(readSplashBranding().texts).toBeUndefined();
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
    await expect(saveSplashBranding(core)).resolves.toBeUndefined();
    spy.mockRestore();
  });
});

describe('dismissBootSplash', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML =
      '<div id="boot-splash" role="status" aria-label="Starting Waldur"></div>';
  });
  afterEach(() => vi.useRealTimers());

  const splash = () => screen.queryByRole('status', { name: /^Starting/ });

  it('removes the splash at once', () => {
    dismissBootSplash();
    expect(splash()).toBeNull();
  });

  it('fades the splash out before removing it', () => {
    dismissBootSplash({ fade: true });
    expect(splash()).toHaveAttribute('data-leaving');
    vi.advanceTimersByTime(200);
    expect(splash()).toBeNull();
  });

  it('does nothing without a splash', () => {
    document.body.innerHTML = '';
    expect(() => dismissBootSplash({ fade: true })).not.toThrow();
  });
});
