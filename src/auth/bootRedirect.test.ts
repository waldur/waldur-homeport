import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

// public/boot-redirect.js is a plain classic script (no bundling, no CSP
// nonce), so it is exercised here as source text against a stubbed window.
const source = readFileSync(
  path.resolve(__dirname, '../../public/boot-redirect.js'),
  'utf8',
);

type ProbeResult = { type: string; status: number };

const OK: ProbeResult = { type: 'basic', status: 204 };

interface Scenario {
  pathname?: string;
  search?: string;
  base?: string;
  apiUrl?: string;
  local?: Record<string, string>;
  session?: Record<string, string>;
  probe?: ProbeResult | Error | 'absent';
  storage?: 'throwing-accessor';
}

const ORIGIN = 'https://portal.example.com';

const flush = async () => {
  for (let i = 0; i < 3; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
};

function run({
  pathname = '/',
  search = '',
  base = '/',
  apiUrl = 'https://api.example.com/',
  local = {},
  session = {},
  probe = OK,
  storage,
}: Scenario = {}) {
  const replace = vi.fn();
  const fetch = vi.fn(() =>
    probe instanceof Error ? Promise.reject(probe) : Promise.resolve(probe),
  );
  const values = (obj: Record<string, string>) => ({
    getItem: (key: string) => (key in obj ? obj[key] : null),
  });
  const win: Record<string, unknown> = {
    location: {
      pathname,
      search,
      origin: ORIGIN,
      href: `${ORIGIN}${pathname}${search}`,
      replace,
    },
    document: {
      querySelector: (selector: string) => {
        if (selector === 'base') {
          return { getAttribute: () => base };
        }
        if (selector === 'meta[name="api-url"]') {
          return { getAttribute: () => apiUrl };
        }
        return null;
      },
    },
  };
  if (storage === 'throwing-accessor') {
    for (const name of ['localStorage', 'sessionStorage']) {
      Object.defineProperty(win, name, {
        get() {
          throw new Error('blocked');
        },
      });
    }
  } else {
    win.localStorage = values(local);
    win.sessionStorage = values(session);
  }
  if (probe !== 'absent') {
    win.fetch = fetch;
  }
  new Function('window', source)(win);
  return { replace, fetch };
}

const expectedUrl = (extra = '') =>
  `https://api.example.com/api-auth/default/init/?return_url=${encodeURIComponent(
    ORIGIN,
  )}${extra}`;

describe('boot-redirect.js', () => {
  it('probes the endpoint and sends an anonymous visitor of the root to it', async () => {
    const { replace, fetch } = run();
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith(expectedUrl()));
    // The probe is marked as such; the navigation that follows is not.
    expect(fetch).toHaveBeenCalledWith(
      expectedUrl() + '&probe=1',
      expect.objectContaining({ redirect: 'manual', credentials: 'omit' }),
    );
    expect(replace).toHaveBeenCalledWith(
      expect.not.stringContaining('probe=1'),
    );
  });

  it.each(['/login/', '/login'])('redirects from %s', async (pathname) => {
    const { replace } = run({ pathname });
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith(expectedUrl()));
  });

  it('keeps the probe parameter out of the language hint', async () => {
    const { replace } = run({ local: { 'waldur/i18n/lang': 'et' } });
    await vi.waitFor(() =>
      expect(replace).toHaveBeenCalledWith(expectedUrl('&ui_locales=et')),
    );
  });

  it('forwards the stored language as ui_locales', async () => {
    const { replace } = run({ local: { 'waldur/i18n/lang': 'et' } });
    await vi.waitFor(() =>
      expect(replace).toHaveBeenCalledWith(expectedUrl('&ui_locales=et')),
    );
  });

  it('adds the missing trailing slash to the API URL', async () => {
    const { replace } = run({ apiUrl: 'https://api.example.com' });
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith(expectedUrl()));
  });

  it('respects a non-root base path', async () => {
    const inside = run({ base: '/portal/', pathname: '/portal/login/' });
    await vi.waitFor(() => expect(inside.replace).toHaveBeenCalled());
    const outside = run({ base: '/portal/', pathname: '/' });
    await flush();
    expect(outside.fetch).not.toHaveBeenCalled();
  });

  it.each([
    ['no default provider (404)', { probe: { type: 'basic', status: 404 } }],
    [
      'a backend that predates the probe and redirects',
      { probe: { type: 'opaqueredirect', status: 0 } },
    ],
    [
      'a backend that predates the probe, same origin',
      { probe: { type: 'basic', status: 302 } },
    ],
    ['a backend that is unreachable', { probe: new Error('network') }],
    ['a browser without fetch', { probe: 'absent' as const }],
  ])('stays on the page for %s', async (_label, scenario) => {
    const { replace } = run(scenario);
    await flush();
    expect(replace).not.toHaveBeenCalled();
  });

  it.each([
    ['a deep link', { pathname: '/projects/abc/' }],
    ['the OAuth callback', { pathname: '/oauth_login_completed/keycloak/' }],
    ['disableAutoLogin', { pathname: '/login/', search: '?disableAutoLogin' }],
    ['an invitation', { pathname: '/login/', search: '?_invitation=tok' }],
    ['a token in localStorage', { local: { 'waldur/auth/token': 'abc' } }],
    ['a token in sessionStorage', { session: { 'waldur/auth/token': 'abc' } }],
    ['an unsubstituted API URL', { apiUrl: '__API_URL__' }],
    ['a raw Vite placeholder', { apiUrl: '%VITE_API_URL%' }],
    ['an empty API URL', { apiUrl: '' }],
  ])('does not even probe for %s', async (_label, scenario) => {
    const { replace, fetch } = run(scenario);
    await flush();
    expect(fetch).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });

  it('survives storage accessors that throw', async () => {
    const { replace } = run({ storage: 'throwing-accessor' });
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith(expectedUrl()));
  });
});
