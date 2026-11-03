import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { saveFile } from './exporters/saveFile';
import { registerTable, resetTableRegistry } from './registry';
import { useTableExport } from './useTableExport';

vi.mock('./exporters/saveFile', () => ({ saveFile: vi.fn() }));

const TABLE = 'json-export-table';

const firstPage = [
  {
    uuid: '1',
    name: 'vm-1',
    state: 'OK',
    backend_id: 'b1',
    limits: { cpu: 2 },
  },
];
const secondPage = [
  { uuid: '2', name: 'vm-2', state: 'OK', backend_id: 'b2', limits: null },
];

// What the table holds on screen: trimmed to its visible columns.
const trimmedRows = [{ uuid: '1', name: 'vm-1' }];

const props = {
  filter: { state: 'OK', field: ['uuid', 'name'] },
  rows: trimmedRows,
  columns: [{ id: 'name', title: 'Name', keys: ['name'] }],
  activeColumns: { name: ['name'] },
};

const renderExport = () => {
  const store = createStore(() => ({
    tables: {
      [TABLE]: {
        pagination: { resultCount: 12, currentPage: 2, pageSize: 10 },
        query: 'vm',
        sorting: { field: 'name', mode: 'desc' },
        activeColumns: props.activeColumns,
      },
    },
  }));
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return renderHook(() => useTableExport(TABLE, props), { wrapper }).result
    .current;
};

const savedRows = async () => {
  const [blob, name] = vi.mocked(saveFile).mock.calls[0];
  expect(name).toBe(`${TABLE}.json`);
  return JSON.parse(await (blob as Blob).text());
};

describe('useTableExport as JSON', () => {
  const fetchData = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    resetTableRegistry();
    fetchData.mockImplementation(({ currentPage }) =>
      Promise.resolve(
        currentPage === 1
          ? { rows: firstPage, resultCount: 2, nextPage: 2 }
          : { rows: secondPage, resultCount: 2, nextPage: null },
      ),
    );
    registerTable({
      table: TABLE,
      fetchData,
      queryField: 'name',
      // A custom export shapes CSV and the rest; JSON leaves it out.
      exportKeys: ['uuid'],
      exportFields: ['UUID'],
      exportRow: (row) => [row.uuid],
    } as any);
  });

  it('writes every page as the API returns it, without trimming fields', async () => {
    await renderExport()({ format: 'json', withFilters: true, allPages: true });

    expect(fetchData).toHaveBeenCalledTimes(2);
    for (const [request] of fetchData.mock.calls) {
      expect(request.filter).not.toHaveProperty('field');
      expect(request.filter).toMatchObject({
        state: 'OK',
        name: 'vm',
        o: '-name',
      });
    }
    expect(await savedRows()).toEqual([...firstPage, ...secondPage]);
  });

  it('fetches the current page again rather than writing the trimmed rows', async () => {
    await renderExport()({
      format: 'json',
      withFilters: true,
      allPages: false,
    });

    expect(fetchData).toHaveBeenCalledTimes(1);
    const [request] = fetchData.mock.calls[0];
    expect(request).toMatchObject({ currentPage: 2, pageSize: 10 });
    expect(request.filter).not.toHaveProperty('field');
    expect(await savedRows()).toEqual(secondPage);
  });

  it('keeps the filters for the current page, which is the rows on screen', async () => {
    await renderExport()({
      format: 'json',
      withFilters: false,
      allPages: false,
    });

    const [request] = fetchData.mock.calls[0];
    expect(request.filter).toEqual({ state: 'OK', name: 'vm', o: '-name' });
  });

  it('drops the table filters and search when they are not applied', async () => {
    await renderExport()({
      format: 'json',
      withFilters: false,
      allPages: true,
    });

    const [request] = fetchData.mock.calls[0];
    expect(request.filter).toEqual({ o: '-name' });
  });
});
