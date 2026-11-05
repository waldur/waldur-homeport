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

// A scoped table: its scope sits in the same filter as the user's filters.
const props = {
  filter: { project_uuid: 'p1', state: 'OK', field: ['uuid', 'name'] },
  rows: trimmedRows,
  columns: [{ id: 'name', title: 'Name', keys: ['name'] }],
  activeColumns: { name: ['name'] },
};

const renderExport = (ownProps: Record<string, any> = props) => {
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
  return renderHook(() => useTableExport(TABLE, ownProps), { wrapper }).result
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
    await renderExport()({ format: 'json', allPages: true });

    expect(fetchData).toHaveBeenCalledTimes(2);
    for (const [request] of fetchData.mock.calls) {
      expect(request.filter).not.toHaveProperty('field');
      expect(request.filter).toMatchObject({
        project_uuid: 'p1',
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
      allPages: false,
    });

    expect(fetchData).toHaveBeenCalledTimes(1);
    const [request] = fetchData.mock.calls[0];
    expect(request).toMatchObject({ currentPage: 2, pageSize: 10 });
    expect(request.filter).not.toHaveProperty('field');
    expect(await savedRows()).toEqual(secondPage);
  });

  it("keeps the table's scope, filters and search for every page", async () => {
    await renderExport()({ format: 'json', allPages: true });

    const [request] = fetchData.mock.calls[0];
    expect(request.filter).toEqual({
      project_uuid: 'p1',
      state: 'OK',
      name: 'vm',
      o: '-name',
    });
  });

  it('passes the search term to the full report', async () => {
    const download = vi.fn(() => Promise.resolve());
    await renderExport({ ...props, fullExport: { label: 'Full', download } })({
      format: 'csv',
      content: 'full',
      allPages: true,
    });

    expect(download).toHaveBeenCalledWith({ query: 'vm' });
    expect(fetchData).not.toHaveBeenCalled();
  });
});
