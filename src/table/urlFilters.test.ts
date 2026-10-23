import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { configureHomeportTableHost } from '@/core/tableHost';

import { configureTableHost } from './host';
import { getInitialValues, syncFiltersToURL } from './urlFilters';

// The browser defaults, as in an app without a router of its own.
describe('URL filters without a router', () => {
  let replaceState: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    configureTableHost({});
    Object.defineProperty(window, 'location', {
      value: { pathname: '/n/projects/', search: '', hash: '#top' },
      writable: true,
    });
    replaceState = vi
      .spyOn(window.history, 'replaceState')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    replaceState.mockRestore();
    configureHomeportTableHost();
  });

  it('writes filters into the query, keeping the path, hash and other params', () => {
    window.location.search = '?tab=list';

    syncFiltersToURL({
      state: 'OK',
      customer: { uuid: '0123456789abcdef0123456789abcdef', name: 'Acme Lab' },
    });

    expect(replaceState).toHaveBeenCalledWith(
      window.history.state,
      '',
      '/n/projects/?tab=list&state=OK&customer=0123456789abcdef0123456789abcdef%3A%3AAcme%20Lab#top',
    );
  });

  it('reads filters back from the query, repeated keys as arrays', () => {
    window.location.search =
      '?state=OK&state=Erred&customer=0123456789abcdef0123456789abcdef%3A%3AAcme%20Lab&tab=list';

    expect(getInitialValues(undefined, new Set(['state', 'customer']))).toEqual(
      {
        state: ['OK', 'Erred'],
        customer: {
          uuid: '0123456789abcdef0123456789abcdef',
          name: 'Acme Lab',
        },
      },
    );
  });
});
