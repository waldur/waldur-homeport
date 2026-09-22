import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceOfferingMergesAffectedList,
  OfferingMergeAffectedRow,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { MergeAffectedRowsDialog } from './MergeAffectedRowsDialog';
import { MergeEntryRow } from './utils';

const useTableSpy = vi.fn();

// Capture what the dialog asks the table to fetch, and render the page the SDK
// answered with through the real columns.
vi.mock('@/table/useTable', async () => {
  const { useEffect, useState } = await import('react');
  return {
    useTable: (config: any) => {
      useTableSpy(config);
      const [rows, setRows] = useState<any[]>([]);
      useEffect(() => {
        let alive = true;
        config
          .fetchData({ currentPage: 1, pageSize: 10 })
          .then((page: any) => alive && setRows(page.rows));
        return () => {
          alive = false;
        };
      }, []);
      return { rows, fetch: vi.fn() };
    },
  };
});

vi.mock('@/table/Table', () => ({
  default: (props: any) => (
    <div data-testid="table">
      <div data-testid="header">
        {props.columns.map((column: any, index: number) => (
          <span key={index} data-testid="header-cell">
            {column.title}
          </span>
        ))}
      </div>
      {props.rows.map((row: any) => (
        <div key={row.id} data-testid="row">
          {props.columns.map((column: any, index: number) => (
            <span key={index}>{column.render({ row })}</span>
          ))}
        </div>
      ))}
    </div>
  ),
}));

const entry: MergeEntryRow = {
  label: 'invoices.InvoiceItem.details',
  title: 'Invoice lines and their details',
  areaTitle: 'Invoices',
  effectTitle: 'Rewritten in place',
  count: 12,
  leftOnSource: 1,
  canListRows: true,
};

const rows: OfferingMergeAffectedRow[] = [
  {
    id: 1,
    uuid: 'item-1',
    model: 'invoices.InvoiceItem',
    field: 'details',
    description: 'Invoice 42, Acme, VM one, cores, 2026-08, 10.00',
    old_value: 'Old offering',
    new_value: 'New offering',
    kept_on_source: false,
  },
  {
    id: 2,
    uuid: 'item-2',
    model: 'invoices.InvoiceItem',
    field: 'details',
    description: 'Invoice 43, Acme, VM two, cores, 2026-07, 5.00',
    old_value: 'Old offering',
    new_value: null,
    kept_on_source: true,
  },
];

const respond = (page: OfferingMergeAffectedRow[], count: number) =>
  ({
    data: page,
    response: {
      headers: new Headers({
        'content-type': 'application/json',
        'x-result-count': String(count),
      }),
    },
  }) as any;

describe('MergeAffectedRowsDialog', () => {
  beforeEach(() => {
    useTableSpy.mockClear();
    vi.mocked(marketplaceOfferingMergesAffectedList).mockReset();
    vi.mocked(marketplaceOfferingMergesAffectedList).mockResolvedValue(
      respond(rows, 12),
    );
  });

  it('lists the rows of the entry and marks the ones kept on the source', async () => {
    renderWithProviders(
      <MergeAffectedRowsDialog resolve={{ mergeUuid: 'merge-1', entry }} />,
    );

    await waitFor(() => expect(screen.getAllByTestId('row')).toHaveLength(2));
    expect(marketplaceOfferingMergesAffectedList).toHaveBeenCalledWith(
      expect.objectContaining({
        path: { uuid: 'merge-1' },
        query: expect.objectContaining({
          entry: 'invoices.InvoiceItem.details',
          page: 1,
          page_size: 10,
        }),
      }),
    );
    expect(
      screen.getByText('Invoice 42, Acme, VM one, cores, 2026-08, 10.00'),
    ).toBeInTheDocument();
    expect(screen.getByText('New offering')).toBeInTheDocument();
    // The pill repeats the column, so a row reads on its own.
    expect(
      screen.getAllByText('Stays on the source').length,
    ).toBeGreaterThanOrEqual(2);
  });

  it('explains on the column what staying on the source means', async () => {
    renderWithProviders(
      <MergeAffectedRowsDialog resolve={{ mergeUuid: 'merge-1', entry }} />,
    );

    await waitFor(() =>
      expect(screen.getByTestId('header')).toBeInTheDocument(),
    );
    const heading = screen.getAllByTestId('header-cell').at(-1);
    expect(heading).toHaveTextContent('Stays on the source');
    // eslint-disable-next-line testing-library/no-node-access
    const tip = heading.querySelector('[data-testid="help-tip"]');
    expect(tip).not.toBeNull();
    await userEvent.hover(tip as Element);
    expect(
      (await screen.findAllByText(/leaves these rows on the archived source/))
        .length,
    ).toBeGreaterThan(0);
    expect(
      await screen.findByText(/A dash means the merge changes the row/),
    ).toBeInTheDocument();
  });

  it('stacks the current value and what it becomes, and lets both wrap', async () => {
    renderWithProviders(
      <MergeAffectedRowsDialog resolve={{ mergeUuid: 'merge-1', entry }} />,
    );

    await waitFor(() => expect(screen.getAllByTestId('row')).toHaveLength(2));
    // One column holds both values, so a long snapshot string has the width.
    expect(screen.getByText('becomes')).toBeInTheDocument();
    expect(
      screen.getByText('Unchanged: it stays on the archived source.'),
    ).toBeInTheDocument();
  });

  it('asks the endpoint for the page the table is on', async () => {
    renderWithProviders(
      <MergeAffectedRowsDialog resolve={{ mergeUuid: 'merge-1', entry }} />,
    );
    await waitFor(() => expect(useTableSpy).toHaveBeenCalled());

    vi.mocked(marketplaceOfferingMergesAffectedList).mockResolvedValue(
      respond(rows.slice(0, 1), 12),
    );
    const { fetchData } = useTableSpy.mock.calls[0][0];
    const page = await fetchData({ currentPage: 3, pageSize: 5 });

    expect(marketplaceOfferingMergesAffectedList).toHaveBeenLastCalledWith(
      expect.objectContaining({
        path: { uuid: 'merge-1' },
        query: expect.objectContaining({
          entry: 'invoices.InvoiceItem.details',
          page: 3,
          page_size: 5,
        }),
      }),
    );
    expect(page.rows).toHaveLength(1);
    expect(page.resultCount).toBe(12);
  });
});
