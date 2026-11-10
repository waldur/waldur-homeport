import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  fetchMicroApps,
  isMicroAppVisible,
  MicroAppEntry,
  portalBase,
  resetMicroAppsRegistry,
} from './microApps';

const app = (visibleTo: Partial<MicroAppEntry['visibleTo']> = {}) => ({
  name: 'provider-calls',
  title: 'Calls for providers',
  description: '',
  visibleTo: { features: [], roles: [], staffOnly: false, ...visibleTo },
});

const ON = { user: { show_micro_apps: true } };
const viewer = (roleNames: string[] = [], isStaff = false) => ({
  isStaff,
  roleNames,
});

describe('isMicroAppVisible', () => {
  it('lists nothing while the micro-apps feature is off', () => {
    expect(isMicroAppVisible(app(), viewer([], true), {})).toBe(false);
    expect(
      isMicroAppVisible(app(), viewer([], true), {
        user: { show_micro_apps: false },
      }),
    ).toBe(false);
  });

  it('shows an app without rules to every signed-in user', () => {
    expect(isMicroAppVisible(app(), viewer(), ON)).toBe(true);
  });

  it('needs every feature the app names', () => {
    const needs = app({
      features: ['marketplace.show_call_management_functionality'],
    });
    expect(isMicroAppVisible(needs, viewer(), ON)).toBe(false);
    expect(
      isMicroAppVisible(needs, viewer(), {
        ...ON,
        marketplace: { show_call_management_functionality: true },
      }),
    ).toBe(true);
  });

  it('needs one of the roles the app names; staff and support pass', () => {
    const forManagers = app({ roles: ['OFFERING.MANAGER'] });
    expect(isMicroAppVisible(forManagers, viewer(['CUSTOMER.OWNER']), ON)).toBe(
      false,
    );
    expect(
      isMicroAppVisible(forManagers, viewer(['OFFERING.MANAGER']), ON),
    ).toBe(true);
    expect(isMicroAppVisible(forManagers, viewer([], true), ON)).toBe(true);
    expect(
      isMicroAppVisible(
        forManagers,
        { isStaff: false, isSupport: true, roleNames: [] },
        ON,
      ),
    ).toBe(true);
  });

  it('keeps a staff-only app from everyone else, whatever their roles', () => {
    const staffOnly = app({ staffOnly: true, roles: ['OFFERING.MANAGER'] });
    expect(isMicroAppVisible(staffOnly, viewer(['OFFERING.MANAGER']), ON)).toBe(
      false,
    );
    expect(isMicroAppVisible(staffOnly, viewer([], true), ON)).toBe(true);
  });
});

describe('portalBase', () => {
  it('is the root app’s own base', () => {
    expect(portalBase('/')).toBe('/');
    expect(portalBase('/21684/')).toBe('/21684/');
  });

  it('is the path above a micro-app, under a relocated deployment too', () => {
    expect(portalBase('/provider-calls/', 'provider-calls')).toBe('/');
    expect(portalBase('/21684/provider-calls/', 'provider-calls')).toBe(
      '/21684/',
    );
  });

  it('stays put on a micro-app’s standalone dev server', () => {
    expect(portalBase('/', 'provider-calls')).toBe('/');
  });
});

describe('fetchMicroApps', () => {
  const respond = (body: string, contentType: string, ok = true) =>
    vi.fn().mockResolvedValue(
      new Response(body, {
        status: ok ? 200 : 404,
        headers: { 'content-type': contentType },
      }),
    );

  beforeEach(() => resetMicroAppsRegistry());
  afterEach(() => vi.unstubAllGlobals());

  it('reads the registry next to the portal', async () => {
    const fetchMock = respond(
      JSON.stringify({ apps: [app()] }),
      'application/json',
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchMicroApps('/21684/')).resolves.toEqual([app()]);
    expect(fetchMock).toHaveBeenCalledWith(
      '/21684/micro-apps.json',
      expect.anything(),
    );
  });

  it('lists nothing when the SPA fallback answers with index.html', async () => {
    vi.stubGlobal('fetch', respond('<!doctype html>', 'text/html'));
    await expect(fetchMicroApps('/')).resolves.toEqual([]);
  });

  it('lists nothing when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('down')));
    await expect(fetchMicroApps('/')).resolves.toEqual([]);
  });

  it('asks again after a failure, not after a success', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('down'))
      .mockResolvedValue(
        new Response(JSON.stringify({ apps: [app()] }), {
          headers: { 'content-type': 'application/json' },
        }),
      );
    vi.stubGlobal('fetch', fetchMock);
    await expect(fetchMicroApps('/')).resolves.toEqual([]);
    await expect(fetchMicroApps('/')).resolves.toEqual([app()]);
    await fetchMicroApps('/');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('asks once per page', async () => {
    const fetchMock = respond(JSON.stringify({ apps: [] }), 'application/json');
    vi.stubGlobal('fetch', fetchMock);
    await fetchMicroApps('/');
    await fetchMicroApps('/');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
