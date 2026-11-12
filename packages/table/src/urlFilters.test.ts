import { configureHomeportTableHost } from '@/core/tableHost';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
          title: 'Acme Lab',
          full_name: 'Acme Lab',
        },
      },
    );
  });

  it('keeps the label of a titled or user value through the query', () => {
    syncFiltersToURL({
      category: { uuid: '0123456789abcdef0123456789abcdef', title: 'HPC' },
      applicant: {
        uuid: 'fedcba9876543210fedcba9876543210',
        full_name: 'Niels Bohr',
      },
    });
    const url = replaceState.mock.calls.at(-1)[2];
    window.location.search = url.slice(url.indexOf('?'), url.indexOf('#'));

    const values = getInitialValues(
      undefined,
      new Set(['category', 'applicant']),
    );
    expect(values.category.title).toBe('HPC');
    expect(values.applicant.full_name).toBe('Niels Bohr');
  });
});
