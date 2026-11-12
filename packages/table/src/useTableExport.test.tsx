import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import exportAs from './exporters';
import { saveFile } from './exporters/saveFile';
import { registerTable, resetTableRegistry } from './registry';
import { useTableExport } from './useTableExport';

vi.mock('./exporters/saveFile', () => ({ saveFile: vi.fn() }));
vi.mock('./exporters', () => ({ default: vi.fn() }));

const closeDialog = vi.fn();
const showSuccess = vi.fn();
const showErrorResponse = vi.fn();
vi.mock('waldur-ui', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useModal: () => ({ closeDialog }),
}));
vi.mock('waldur-notifications', () => ({
  useNotify: () => ({ showSuccess, showErrorResponse }),
}));

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
  return renderHook(() => useTableExport(TABLE, ownProps), { wrapper });
};

const exportTable = (config, ownProps?: Record<string, any>) =>
  renderExport(ownProps).result.current.exportTable(config);

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
    await exportTable({ format: 'json', allPages: true });

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
    await exportTable({
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
    await exportTable({ format: 'json', allPages: true });

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
    await exportTable(
      { format: 'csv', content: 'full', allPages: true },
      { ...props, fullExport: { label: 'Full', download } },
    );

    expect(download).toHaveBeenCalledWith({
      query: 'vm',
      signal: expect.any(AbortSignal),
    });
    expect(fetchData).not.toHaveBeenCalled();
  });
});

describe('useTableExport when stopped', () => {
  const fetchData = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    resetTableRegistry();
    registerTable({ table: TABLE, fetchData } as any);
  });

  const expectNothingDone = () => {
    expect(saveFile).not.toHaveBeenCalled();
    expect(exportAs).not.toHaveBeenCalled();
    expect(showSuccess).not.toHaveBeenCalled();
    expect(showErrorResponse).not.toHaveBeenCalled();
    expect(closeDialog).not.toHaveBeenCalled();
  };

  it.each(['csv', 'json'])(
    'aborts the %s request on unmount and does nothing after',
    async (format) => {
      const hook = renderExport();
      fetchData.mockImplementation(
        ({ options }) =>
          // As fetch does: rejects at once if already aborted.
          new Promise((_, reject) => {
            const fail = () =>
              reject(new DOMException('Aborted', 'AbortError'));
            if (options.signal.aborted) fail();
            options.signal.addEventListener('abort', fail);
          }),
      );
      const run = hook.result.current.exportTable({
        format,
        allPages: true,
      } as any);
      hook.unmount();
      await run;

      expect(fetchData).toHaveBeenCalledTimes(1);
      expect(fetchData.mock.calls[0][0].options.signal.aborted).toBe(true);
      expectNothingDone();
    },
  );

  it('requests no further page after abort', async () => {
    const hook = renderExport();
    fetchData.mockImplementation(() => {
      hook.result.current.abort();
      return Promise.resolve({ rows: firstPage, resultCount: 2, nextPage: 2 });
    });
    await hook.result.current.exportTable({
      format: 'csv',
      allPages: true,
    } as any);

    expect(fetchData).toHaveBeenCalledTimes(1);
    expectNothingDone();
  });

  it('stays silent when the full report is aborted', async () => {
    const download = vi.fn(() => {
      hook.result.current.abort();
      return Promise.resolve();
    });
    const hook = renderExport({
      ...props,
      fullExport: { label: 'Full', download },
    });
    await hook.result.current.exportTable({
      format: 'csv',
      content: 'full',
      allPages: true,
    } as any);

    expect(download).toHaveBeenCalledTimes(1);
    expectNothingDone();
  });
});
