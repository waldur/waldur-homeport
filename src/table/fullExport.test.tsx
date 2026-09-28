import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { describe, expect, it, vi, beforeEach, Mock } from 'vitest';

import { useModal } from '@/modal/actions';

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
