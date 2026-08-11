import { renderHook } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getQueryParams, syncFiltersToURL } from '@/core/filters';
import { TABLE_KEY as AUTHENTICATED_TABLE } from '@/support/SupportAIAssistantLogsList';
import * as tableActions from '@/table/actions';

import { TABLE_KEY as ANONYMOUS_TABLE } from './AnonymousChatPanel';
import { ChatChannel } from './sharedChatFilters';
import { useSharedChatFilters } from './useSharedChatFilters';

vi.mock('@/core/filters', () => ({
  syncFiltersToURL: vi.fn(),
  getQueryParams: vi.fn(() => ({})),
}));

const dispatched: any[] = [];

const renderMirror = (
  activeChannel: ChatChannel,
  filters: Record<string, any[]> = {},
  queries: Record<string, string> = {},
) => {
  dispatched.length = 0;
  const tableNames = new Set([
    ...Object.keys(filters),
    ...Object.keys(queries),
  ]);
  const state = {
    tables: Object.fromEntries(
      [...tableNames].map((table) => [
        table,
        { filtersStorage: filters[table] ?? [], query: queries[table] ?? '' },
      ]),
    ),
  };
  const store = createStore((current = state, action: any) => {
    dispatched.push(action);
    return current;
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );
  return renderHook(() => useSharedChatFilters(activeChannel), { wrapper });
};

const stored = (name: string, value: any) => [
  { name, value, label: null, component: null },
];

const mirrored = () =>
  dispatched.filter((action) => action.type === tableActions.SET_FILTER);

const queryWrites = () =>
  dispatched.filter((action) => action.type === tableActions.SET_FILTER_QUERY);

beforeEach(() => {
  vi.mocked(syncFiltersToURL).mockClear();
  vi.mocked(getQueryParams).mockReset().mockReturnValue({});
});

describe('useSharedChatFilters', () => {
  it('carries a same-named filter to the other tab', () => {
    renderMirror('authenticated', {
      [AUTHENTICATED_TABLE]: stored('is_flagged', true),
    });

    const write = mirrored().find(
      (action) => action.payload.item.name === 'is_flagged',
    );
    expect(write.payload.table).toBe(ANONYMOUS_TABLE);
    expect(write.payload.item.value).toBe(true);
  });

  it('translates a filter the two channels name differently', () => {
    const severity = { label: 'High', value: 'high' };
    renderMirror('authenticated', {
      [AUTHENTICATED_TABLE]: stored('max_severity', severity),
    });

    const write = mirrored().find(
      (action) => action.payload.item.name === 'severity',
    );
    expect(write.payload.table).toBe(ANONYMOUS_TABLE);
    expect(write.payload.item.value).toBe(severity);
  });

  it('keeps the counterpart URL param in step for a translated filter', () => {
    // Without this the cleared-on-one-tab value is re-seeded from the URL on
    // the other, because no mounted table owns the counterpart name.
    const severity = { label: 'High', value: 'high' };
    renderMirror('authenticated', {
      [AUTHENTICATED_TABLE]: stored('max_severity', severity),
    });

    expect(syncFiltersToURL).toHaveBeenCalledWith({ severity });
  });

  it('does not touch the URL for a same-named filter', () => {
    // The mounted table's own sync effect already owns that param.
    renderMirror('authenticated', {
      [AUTHENTICATED_TABLE]: stored('is_flagged', true),
    });

    expect(syncFiltersToURL).not.toHaveBeenCalledWith(
      expect.objectContaining({ is_flagged: expect.anything() }),
    );
  });

  it('clears the counterpart when the active tab has no value', () => {
    renderMirror('anonymous', {
      [ANONYMOUS_TABLE]: [],
      [AUTHENTICATED_TABLE]: stored('max_severity', {
        label: 'High',
        value: 'high',
      }),
    });

    const write = mirrored().find(
      (action) => action.payload.item.name === 'max_severity',
    );
    expect(write.payload.table).toBe(AUTHENTICATED_TABLE);
    expect(write.payload.item.value).toBeNull();
    expect(syncFiltersToURL).toHaveBeenCalledWith({ max_severity: null });
  });

  it('clears a same-named counterpart without touching the URL', () => {
    // Route 1: the other tab's storage survives unmount, so without this the
    // stale value is written back to the URL the moment it remounts. The
    // mounted table already deleted the shared param, so no URL write here.
    renderMirror('anonymous', {
      [ANONYMOUS_TABLE]: [],
      [AUTHENTICATED_TABLE]: stored('is_flagged', true),
    });

    const write = mirrored().find(
      (action) => action.payload.item.name === 'is_flagged',
    );
    expect(write.payload.table).toBe(AUTHENTICATED_TABLE);
    expect(write.payload.item.value).toBeNull();
    expect(syncFiltersToURL).not.toHaveBeenCalled();
  });

  it('dispatches nothing when both tabs already agree', () => {
    renderMirror('authenticated', {
      [AUTHENTICATED_TABLE]: stored('is_flagged', true),
      [ANONYMOUS_TABLE]: stored('is_flagged', true),
    });

    expect(mirrored()).toEqual([]);
  });

  it('leaves per-channel filters alone', () => {
    renderMirror('authenticated', {
      [AUTHENTICATED_TABLE]: stored('user', { uuid: 'u1' }),
    });

    expect(mirrored()).toEqual([]);
  });

  it('carries the search term to the other tab', () => {
    // Both endpoints run the same Postgres full-text search over the message
    // vector, so a term means the same thing on either tab.
    renderMirror('authenticated', {}, { [AUTHENTICATED_TABLE]: 'openstack' });

    const write = queryWrites()[0];
    expect(write.payload.table).toBe(ANONYMOUS_TABLE);
    expect(write.payload.query).toBe('openstack');
  });

  it('persists the search term to the URL', () => {
    // query lives on the table slice, not filtersStorage, so useTable's own
    // sync never sees it — without this it would cross tabs but die on reload.
    renderMirror('authenticated', {}, { [AUTHENTICATED_TABLE]: 'openstack' });

    expect(syncFiltersToURL).toHaveBeenCalledWith({ query: 'openstack' });
  });

  it('clears the search term on the other tab and in the URL', () => {
    renderMirror(
      'anonymous',
      {},
      { [ANONYMOUS_TABLE]: '', [AUTHENTICATED_TABLE]: 'openstack' },
    );

    const write = queryWrites()[0];
    expect(write.payload.table).toBe(AUTHENTICATED_TABLE);
    expect(write.payload.query).toBe('');
    expect(syncFiltersToURL).toHaveBeenCalledWith({ query: null });
  });

  it('restores the search term from the URL onto both tabs', () => {
    vi.mocked(getQueryParams).mockReturnValue({ query: 'openstack' });

    renderMirror('authenticated');

    expect(queryWrites().map((action) => action.payload.table)).toEqual([
      AUTHENTICATED_TABLE,
      ANONYMOUS_TABLE,
    ]);
  });

  it('dispatches no query write when both tabs already agree', () => {
    renderMirror(
      'authenticated',
      {},
      { [AUTHENTICATED_TABLE]: 'openstack', [ANONYMOUS_TABLE]: 'openstack' },
    );

    expect(queryWrites()).toEqual([]);
  });
});
