import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  OfferingMergeEntry,
  OfferingMergePreview,
  OfferingMergeStateEnum,
} from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { renderWithProviders } from '@/test/harness';

import { MergeAffectedRowsDialog } from './MergeAffectedRowsDialog';
import { MergeEntriesView } from './MergeEntriesView';

// The table machinery lives in the Redux store; resolve the in-memory rows and
// render the cells directly, which is what the grouping is about.
vi.mock('@/table/useTable', async () => {
  const { useEffect, useState } = await import('react');
  return {
    useTable: (config: any) => {
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
      {props.rows.map((row: any, index: number) => (
        <div key={index} data-testid="row">
          {props.columns.map((column: any, cell: number) => (
            <span key={cell}>{column.render({ row })}</span>
          ))}
        </div>
      ))}
    </div>
  ),
}));

const entry = (overrides: Partial<OfferingMergeEntry>): OfferingMergeEntry =>
  ({
    label: 'marketplace.Resource.offering',
    area: 'resources_and_orders',
    area_title: 'Resources and orders',
    effect: 'moved',
    effect_title: 'Moved to the target',
    count: 4,
    left_on_source: 0,
    can_list_rows: true,
    ...overrides,
  }) as OfferingMergeEntry;

const preview = (entries: OfferingMergeEntry[]): OfferingMergePreview =>
  ({ entries, counts: {}, left_on_source: {} }) as OfferingMergePreview;

const render = (
  entries: OfferingMergeEntry[],
  mergeState: OfferingMergeStateEnum = 'previewed',
) =>
  renderWithProviders(
    <MergeEntriesView
      preview={preview(entries)}
      mergeUuid="merge-1"
      mergeState={mergeState}
      tableId="test"
    />,
  );

const keptEntry = entry({
  label: 'marketplace.Plan.offering',
  area: 'offering_configuration',
  area_title: 'Offering configuration',
  effect: 'kept_on_source',
  effect_title: 'Kept on the archived source',
  can_list_rows: true,
  count: 2,
});

describe('MergeEntriesView', () => {
  beforeEach(() => {
    vi.mocked(useModal().openDialog).mockClear();
  });

  it('groups the entries by area, in the order the API lists them', async () => {
    render([
      entry({ label: 'invoices.InvoiceItem.details' }),
      entry({}),
      entry({
        label: 'marketplace.ComponentUsage.component',
        area: 'billing_history',
        area_title: 'Billing history',
      }),
    ]);

    await waitFor(() => expect(screen.getAllByTestId('table')).toHaveLength(2));
    const headings = screen
      .getAllByRole('heading')
      .map((heading) => heading.textContent);
    expect(headings).toEqual(['Resources and orders', 'Billing history']);
    // The invoice entry declares the resources area, so it groups with it.
    const [first] = screen.getAllByTestId('table');
    // eslint-disable-next-line testing-library/no-node-access
    expect(first.querySelectorAll('[data-testid="row"]')).toHaveLength(2);
  });

  it('keeps the rows that stay on the source in their own section', async () => {
    render([entry({}), keptEntry]);

    await waitFor(() => expect(screen.getAllByTestId('table')).toHaveLength(2));
    expect(
      screen.getByRole('heading', { name: 'What stays on the sources' }),
    ).toBeInTheDocument();
    // Its area is only a column of the separate section, not a heading.
    expect(
      screen.queryByRole('heading', { name: 'Offering configuration' }),
    ).toBeNull();
    expect(screen.getByText('Plans')).toBeInTheDocument();
  });

  it('opens the drill-down for an entry whose rows can be listed', async () => {
    render([entry({})]);

    await waitFor(() =>
      expect(screen.getByTestId('table')).toBeInTheDocument(),
    );
    await userEvent.click(
      screen.getByRole('button', { name: /4 affected rows of Resources/ }),
    );
    expect(useModal().openDialog).toHaveBeenCalledWith(
      MergeAffectedRowsDialog,
      expect.objectContaining({
        // Snapshot values are long: the drill-down opens wide.
        size: 'xl',
        resolve: expect.objectContaining({
          mergeUuid: 'merge-1',
          entry: expect.objectContaining({
            label: 'marketplace.Resource.offering',
          }),
        }),
      }),
    );
  });

  it('shows no drill-down for an entry whose rows cannot be listed', async () => {
    render([
      entry({
        label: 'marketplace.ComponentUsageMonthly.component',
        area: 'billing_history',
        area_title: 'Billing history',
        effect: 'recomputed',
        effect_title: 'Recomputed after the merge',
        can_list_rows: false,
        count: 7,
      }),
    ]);

    await waitFor(() =>
      expect(screen.getByTestId('table')).toBeInTheDocument(),
    );
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('says how many rows of a deduplicated entry stay on the source', async () => {
    render([
      entry({
        effect: 'deduplicated',
        effect_title: 'Moved unless the target has it already',
        count: 5,
        left_on_source: 2,
      }),
    ]);

    await waitFor(() =>
      expect(screen.getByTestId('table')).toBeInTheDocument(),
    );
    expect(
      screen.getByText('2 of them stay on the source.'),
    ).toBeInTheDocument();
  });

  it('offers no drill-down for kept-on-source rows once the merge has run', async () => {
    // The endpoint lists the journal from this state on, and the merge never
    // wrote these rows; the button would open an empty list.
    render([entry({}), keptEntry], 'done');

    await waitFor(() => expect(screen.getAllByTestId('table')).toHaveLength(2));
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /affected rows of Plans/ }),
    ).toBeNull();
    expect(
      screen.getByText(/nothing to list once it has run/),
    ).toBeInTheDocument();
    // The rows the merge did write are still listable.
    expect(
      screen.getByRole('button', { name: /4 affected rows of Resources/ }),
    ).toBeInTheDocument();
  });

  it('keeps the drill-down on a kept-on-source row before the merge runs', async () => {
    render([keptEntry]);

    await waitFor(() =>
      expect(screen.getByTestId('table')).toBeInTheDocument(),
    );
    expect(
      screen.getByRole('button', { name: /2 affected rows of Plans/ }),
    ).toBeInTheDocument();
  });

  it('says a deduplicated entry leaves rows out of the list after a run', async () => {
    render(
      [
        entry({
          effect: 'deduplicated',
          effect_title: 'Moved unless the target has it already',
          count: 5,
          left_on_source: 2,
        }),
      ],
      'undone',
    );

    await waitFor(() =>
      expect(screen.getByTestId('table')).toBeInTheDocument(),
    );
    expect(
      screen.getByText(
        '2 of them stayed on the source; they are not in the list.',
      ),
    ).toBeInTheDocument();
  });

  it('titles the legacy left-on-source counts as rows the target already has', async () => {
    renderWithProviders(
      <MergeEntriesView
        preview={
          {
            entries: [],
            counts: { 'marketplace.Resource.offering': 3 },
            left_on_source: { 'marketplace.OfferingUser.offering': 1 },
          } as unknown as OfferingMergePreview
        }
        mergeUuid="merge-1"
        mergeState="previewed"
        tableId="test"
      />,
    );

    await waitFor(() => expect(screen.getAllByTestId('table')).toHaveLength(2));
    expect(
      screen.getByRole('heading', { name: 'Rows the target already has' }),
    ).toBeInTheDocument();
    // The old payload counts collisions here, not offering configuration.
    expect(
      screen.queryByRole('heading', { name: 'What stays on the sources' }),
    ).toBeNull();
    expect(
      screen.getByText(/the target has an equivalent already/),
    ).toBeInTheDocument();
    // An unclassified entry has no effect to show, so the cell is a dash.
    expect(screen.getAllByText(DASH_ESCAPE_CODE).length).toBeGreaterThan(0);
  });
});
