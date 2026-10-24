import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { describe, expect, it, vi, beforeEach, Mock } from 'vitest';

import { useModal } from 'waldur-ui';

import { ExportDialog } from './ExportDialog';
import { registerTable } from './registry';
import Table from './Table';
import { TableFullExport } from './types';

// The toolbar names its props explicitly rather than spreading, so fullExport
// reaches the dialog only if every link passes it on. This broke once.
const fullExport: TableFullExport = {
  label: 'Full report',
  description: 'Every field.',
  download: () => Promise.resolve(),
};

const baseProps = {
  loading: false,
  error: null,
  fetch: vi.fn(),
  resetSelection: vi.fn(),
  setFilterPosition: vi.fn(),
  initColumnPositions: vi.fn(),
  rows: [{ uuid: '1', name: 'one' }],
  sorting: { mode: undefined, field: null, loading: false },
  activeColumns: {},
  columnPositions: [],
  columns: [
    { id: 'name', title: 'Name', render: ({ row }) => <>{row.name}</> },
  ],
  table: 'test-table',
};

const renderTable = (props = {}) =>
  render(
    <Provider store={createStore(() => ({}))}>
      <Table {...(baseProps as any)} enableExport {...props} />
    </Provider>,
  );

describe('Table fullExport', () => {
  const openDialog = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useModal as Mock).mockReturnValue({ openDialog, closeDialog: vi.fn() });
  });

  it('reaches the export dialog', async () => {
    renderTable({ fullExport });
    await userEvent.click(screen.getByRole('button', { name: /export/i }));
    expect(openDialog).toHaveBeenCalled();
    const { ownProps } = openDialog.mock.calls[0][1].resolve;
    expect(ownProps.fullExport).toBe(fullExport);
  });

  it('is absent when the table does not offer one', async () => {
    renderTable();
    await userEvent.click(screen.getByRole('button', { name: /export/i }));
    const { ownProps } = openDialog.mock.calls[0][1].resolve;
    expect(ownProps.fullExport).toBeUndefined();
  });
});

// Both stay mounted so the dialog keeps its height.
describe('ExportDialog layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useModal as Mock).mockReturnValue({
      openDialog: vi.fn(),
      closeDialog: vi.fn(),
    });
    registerTable({
      table: 'dialog-table',
      fetchData: () => Promise.resolve({ rows: [], resultCount: 0 }),
    } as any);
  });

  const renderDialog = () =>
    render(
      <Provider store={createStore(() => ({ tables: {} }))}>
        <ExportDialog
          resolve={{
            table: 'dialog-table',
            format: 'csv',
            ownProps: { fullExport } as any,
          }}
        />
      </Provider>,
    );

  it('keeps Format and All pages mounted when the full report is picked', async () => {
    renderDialog();
    expect(screen.getByText('Format')).toBeInTheDocument();
    expect(screen.getByText('All pages')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Full report'));

    expect(screen.getByText('Format')).toBeInTheDocument();
    expect(screen.getByText('All pages')).toBeInTheDocument();
  });
});

describe('ExportDialog PDF size warning', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useModal as Mock).mockReturnValue({
      openDialog: vi.fn(),
      closeDialog: vi.fn(),
    });
    registerTable({
      table: 'pdf-table',
      fetchData: () => Promise.resolve({ rows: [], resultCount: 0 }),
    } as any);
  });

  const renderDialog = (format, resultCount, ownProps = {}) =>
    render(
      <Provider
        store={createStore(() => ({
          tables: {
            'pdf-table': {
              pagination: { resultCount, currentPage: 1, pageSize: 10 },
              activeColumns: {},
            },
          },
        }))}
      >
        <ExportDialog
          resolve={{
            table: 'pdf-table',
            format,
            ownProps: {
              columns: Array.from({ length: 10 }, (_, i) => ({ id: `c${i}` })),
              rows: [],
              ...ownProps,
            } as any,
          }}
        />
      </Provider>,
    );

  it('warns and blocks a PDF of every page when it is over the cell limit', () => {
    renderDialog('pdf', 5_001);
    expect(screen.getByText(/a PDF holds at most/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeDisabled();
  });

  it('says nothing for a PDF within the limits', () => {
    renderDialog('pdf', 5_000);
    expect(screen.queryByText(/a PDF holds at most/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeEnabled();
  });

  it('counts the columns the export holds, not the actions or unexported ones', () => {
    const columns = [
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `c${i}`,
        keys: [`c${i}`],
      })),
      { id: 'hidden', keys: ['hidden'], export: false },
    ];
    renderDialog('pdf', 5_000, {
      columns,
      // The table lists its row actions among the active columns.
      activeColumns: {
        ...Object.fromEntries(columns.map((c) => [c.id, c.keys])),
        actions: [],
      },
    });
    expect(screen.queryByText(/a PDF holds at most/)).not.toBeInTheDocument();
  });

  it('says nothing for CSV of the same table', () => {
    renderDialog('csv', 50_000);
    expect(screen.queryByText(/a PDF holds at most/)).not.toBeInTheDocument();
  });
});

describe('ExportDialog PDF size warning for tables that build their own rows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useModal as Mock).mockReturnValue({
      openDialog: vi.fn(),
      closeDialog: vi.fn(),
    });
    registerTable({
      table: 'custom-rows-table',
      fetchData: () => Promise.resolve({ rows: [], resultCount: 0 }),
      exportRow: (row) => [row.name],
    } as any);
  });

  it('checks the row count alone instead of reporting zero columns', () => {
    render(
      <Provider
        store={createStore(() => ({
          tables: {
            'custom-rows-table': {
              pagination: { resultCount: 12_000, currentPage: 1, pageSize: 10 },
              activeColumns: {},
            },
          },
        }))}
      >
        <ExportDialog
          resolve={{
            table: 'custom-rows-table',
            format: 'pdf',
            ownProps: { columns: [], rows: [] } as any,
          }}
        />
      </Provider>,
    );

    expect(
      screen.getByText(/12,000 rows, but a PDF holds at most 10,000/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/0 columns/)).not.toBeInTheDocument();
  });
});
