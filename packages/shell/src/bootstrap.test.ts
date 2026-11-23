import { describe, expect, it, vi } from 'vitest';
import { LanguageUtilsService } from 'waldur-i18n-runtime';

import { bootstrapMicroApp, whenMicroAppBootstrapped } from './bootstrap';

// A plain function, not vi.fn(): a spy reports the rejection of a promise
// it returned as a test error even when the caller handles it.
const runtimeConfig = vi.hoisted(() => ({
  fetch: (): Promise<any> => Promise.resolve({}),
}));

vi.mock('waldur-runtime-config', () => ({
  fetchRuntimeConfig: () => runtimeConfig.fetch(),
  getApiUrlFromMeta: () => 'https://api.example.org/',
}));
vi.mock('waldur-boot-splash', () => ({ saveSplashBranding: vi.fn() }));
vi.mock('waldur-auth-core', () => ({
  configureAuthCore: vi.fn(),
  initApiClient: vi.fn(),
}));

const deferred = <T>() => {
  let resolve: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve: (value: T) => resolve(value) };
};

const settled = async (promise: Promise<unknown>) => {
  let done = false;
  void promise.then(() => (done = true));
  await new Promise((r) => setTimeout(r));
  return done;
};

describe('whenMicroAppBootstrapped', () => {
  it('settles only once the config and the language have loaded', async () => {
    const config = deferred<any>();
    runtimeConfig.fetch = () => config.promise;
    const locale = deferred<{ default: Record<string, string> }>();

    void bootstrapMicroApp({ loadLocale: () => locale.promise });
    expect(await settled(whenMicroAppBootstrapped())).toBe(false);

    config.resolve({
      plugins: { WALDUR_CORE: {} },
      languageChoices: [{ code: 'et', label: 'Eesti' }],
      defaultLanguage: 'et',
    });
    expect(await settled(whenMicroAppBootstrapped())).toBe(false);

    locale.resolve({ default: {} });
    expect(await settled(whenMicroAppBootstrapped())).toBe(true);
    expect(LanguageUtilsService.getCurrentLanguage().code).toBe('et');
  });

  it('settles when there is no backend', async () => {
    runtimeConfig.fetch = () => Promise.reject(new TypeError('offline'));
    void bootstrapMicroApp();
    expect(await settled(whenMicroAppBootstrapped())).toBe(true);
  });
});

describe('requireSession', () => {
  it('hands a visitor with no session to onSessionExpired at once', () => {
    localStorage.removeItem('waldur/auth/token');
    const onSessionExpired = vi.fn();
    void bootstrapMicroApp({ requireSession: true, onSessionExpired });
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it('lets a signed-in visitor in', () => {
    localStorage.setItem('waldur/auth/token', 'abc');
    const onSessionExpired = vi.fn();
    void bootstrapMicroApp({ requireSession: true, onSessionExpired });
    expect(onSessionExpired).not.toHaveBeenCalled();
    localStorage.removeItem('waldur/auth/token');
  });

  it('leaves a signed-out visitor alone without it', () => {
    localStorage.removeItem('waldur/auth/token');
    const onSessionExpired = vi.fn();
    void bootstrapMicroApp({ onSessionExpired });
    expect(onSessionExpired).not.toHaveBeenCalled();
  });
});
