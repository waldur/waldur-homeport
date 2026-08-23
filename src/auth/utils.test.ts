import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageUtilsService } from '@/i18n/LanguageUtilsService';

import { getOauthURL } from './utils';

// `@/core/config` and `@/i18n/LanguageUtilsService` are globally mocked
// (test/mocks/config.js, test/mocks/i18n.js) — do not re-mock them here.
describe('getOauthURL', () => {
  beforeEach(() => {
    window.location.assign('https://portal.example.com/login/');
  });

  const params = () =>
    new URL(getOauthURL({ provider: 'keycloak' })).searchParams;

  it('points at the provider init endpoint', () => {
    const url = new URL(getOauthURL({ provider: 'keycloak' }));
    expect(url.origin + url.pathname).toBe(
      'http://localhost:8080/api-auth/keycloak/init/',
    );
  });

  it('names the return target return_url, which is what the backend reads', () => {
    expect(params().get('return_url')).toBe('https://portal.example.com');
    expect(params().has('redirect_uri')).toBe(false);
  });

  it('sends the origin only, dropping the current path', () => {
    expect(params().get('return_url')).not.toContain('/login');
  });

  it('passes the current language as ui_locales', () => {
    expect(params().get('ui_locales')).toBe('en');
  });

  it('omits ui_locales when no language is set', () => {
    vi.mocked(LanguageUtilsService.getCurrentLanguage).mockReturnValueOnce(
      undefined,
    );
    expect(params().has('ui_locales')).toBe(false);
  });
});
