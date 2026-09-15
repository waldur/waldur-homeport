import { arrayMove } from '@dnd-kit/sortable';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FC, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { tableStoryBaseProps, tableStoryColumns } from './storyFixtures';
import { TableColumnButton } from './TableColumnsButton';
import { Column, DisplayMode, TableProps } from './types';

/**
 * `TableColumnButton` — the gear-icon popover for showing/hiding optional
 * columns, searching the list, drag-reordering it, and resetting to
 * defaults (`docs/table/columns.md`'s "Optional columns"). It's a fully
 * prop-driven component (no Redux/context reads of its own — `columns`,
 * `activeColumns`, `toggleColumn`, `swapColumns`, `columnPositions`,
 * `initColumnPositions`, `resetColumns` all come from `useTable()`, which
 * is just a thin `dispatch(actions.toggleColumn(...))`-style wrapper), so
 * `ColumnButtonHarness` below reproduces the real reducer's own semantics
 * locally with `useState` (see `store.ts`'s `TOGGLE_COLUMN`/`SWAP_COLUMNS`/
 * `RESET_COLUMNS` cases — this is not invented behavior) rather than using
 * `redux-mock-store`, which doesn't re-run reducers on dispatch and so
 * can't make an interactive demo like this one actually toggle/reorder.
 *
 * A real subtlety worth calling out: `activeColumns[id]` isn't a plain
 * boolean — the reducer sets it to `column.keys` (the fetch-keys array)
 * when a column is active, and `false` when it's not. Every fixture below
 * sets `keys` on every column (not just the optional ones — matching how
 * real columns are defined, e.g. `UserList.tsx`), so `ColumnsPopover`'s
 * `isActive={activeColumns[id]}` truthy-check reads correctly.
 *
 * Columns mix required (no `optional`, on since mount) and `optional:
 * true` (off since mount — `Table.tsx`'s own mount effect: `toggleColumn
 * (column.id, column, column.optional ? false : true)`) — the same real
 * shape `UserList.tsx`/`OrganizationsList.tsx` use, not a hypothetical.
 */
const columnButtonStoryColumns: Column<any>[] = [
  { ...tableStoryColumns[0], keys: ['name'] },
  { ...tableStoryColumns[1], keys: ['status'] },
  { ...tableStoryColumns[2], keys: ['owner'] },
  {
    id: 'region',
    title: 'Region',
    keys: ['region'],
    optional: true,
    render: ({ row }) => <>{row.region}</>,
  },
  {
    id: 'plan',
    title: 'Plan',
    keys: ['plan'],
    optional: true,
    render: ({ row }) => <>{row.plan}</>,
  },
  {
    id: 'tags',
    title: 'Tags',
    keys: ['tags'],
    optional: true,
    render: ({ row }) => <>{row.tags}</>,
  },
];

const initialActiveColumns = columnButtonStoryColumns.reduce(
  (acc, column) => ({
    ...acc,
    [column.id]: column.optional ? false : column.keys,
  }),
  {} as Record<string, any>,
);

const initialColumnPositions = columnButtonStoryColumns.map(
  (column) => column.id,
);

const ColumnButtonHarness: FC<{
  columns?: Column<any>[];
  rowActions?: TableProps['rowActions'];
  mode?: DisplayMode;
}> = ({ columns = columnButtonStoryColumns, rowActions, mode = 'table' }) => {
  const [activeColumns, setActiveColumns] = useState(initialActiveColumns);
  const [columnPositions, setColumnPositions] = useState(
    initialColumnPositions,
  );

  // Mirrors store.ts's TOGGLE_COLUMN case exactly: an explicit `value`
  // wins, otherwise it flips the column's current state.
  const toggleColumn = (id: string, column: Column<any>, value?: boolean) => {
    setActiveColumns((prev) => ({
      ...prev,
      [id]:
        value === false
          ? false
          : value === true
            ? column.keys
            : prev[id]
              ? false
              : column.keys,
    }));
  };

  // Mirrors SWAP_COLUMNS: reorder columnPositions by the two dragged ids.
  const swapColumns = (column1: string, column2: string) => {
    setColumnPositions((prev) =>
      arrayMove(prev, prev.indexOf(column1), prev.indexOf(column2)),
    );
  };

  const resetColumns = () => {
    setActiveColumns({});
    setColumnPositions([]);
  };

  const initColumnPositions = (ids: string[]) => setColumnPositions(ids);

  return (
    <TableColumnButton
      {...tableStoryBaseProps}
      columns={columns}
      activeColumns={activeColumns}
      toggleColumn={toggleColumn}
      swapColumns={swapColumns}
      columnPositions={columnPositions}
      initColumnPositions={initColumnPositions}
      resetColumns={resetColumns}
      rowActions={rowActions}
      mode={mode}
    />
  );
};

const meta: Meta<typeof ColumnButtonHarness> = {
  title: 'Data Display/Table/TableColumnButton',
  component: ColumnButtonHarness,
};
export default meta;

type Story = StoryObj<typeof ColumnButtonHarness>;

/** Closed by default — real component state (`RadixPopover.Root`'s own
 * uncontrolled `open`), not a prop. Just the gear-icon trigger. */
export const Closed: Story = {
  render: () => <ColumnButtonHarness />,
};

/** Opened — the searchable, draggable column list: required columns
 * (Name/Status/Owner) checked, optional ones (Region/Plan/Tags)
 * unchecked, matching their real mount-time defaults. */
export const Open: Story = {
  render: () => <ColumnButtonHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Toggle visible columns' }),
    );
    await waitFor(() =>
      expect(document.querySelector('.mw-400px')).toBeTruthy(),
    );
  },
};

const getDropdownItem = (text: string): HTMLElement => {
  const row = Array.from(document.querySelectorAll('.dropdown-item')).find(
    (el) => el.textContent?.includes(text),
  );
  if (!row) throw new Error(`"${text}" row not found`);
  return row as HTMLElement;
};

/** Checking an optional column's box turns it on — a real state change,
 * not just a click landing: the checkbox itself flips to checked. */
export const ToggleColumn: Story = {
  render: () => <ColumnButtonHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Toggle visible columns' }),
    );

    await waitFor(() => getDropdownItem('Region'));
    const regionRow = getDropdownItem('Region');
    // The checkbox is a bare `<input>` with no `<label>` (see
    // ColumnsPopover's SortableItem) — clicking the outer row instead
    // hits its own `role="button"` drag-sortable wrapper (dnd-kit's
    // `useSortable` listeners), not the checkbox's onChange.
    const checkbox = regionRow.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);

    await userEvent.click(checkbox);
    await waitFor(() => expect(checkbox.checked).toBe(true));
  },
};

/** Typing into the search box narrows the list to matching column
 * titles — `ColumnsPopover`'s own `query` state, a real filter, not a
 * static screenshot of pre-filtered rows. */
export const SearchColumns: Story = {
  render: () => <ColumnButtonHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Toggle visible columns' }),
    );
    await waitFor(() =>
      document.querySelector('input[placeholder="Search..."]'),
    );
    const search = document.querySelector<HTMLInputElement>(
      'input[placeholder="Search..."]',
    );
    await userEvent.type(search, 'Region');

    await waitFor(() => {
      const items = Array.from(document.querySelectorAll('.dropdown-item'));
      expect(items).toHaveLength(1);
      expect(items[0].textContent).toContain('Region');
    });
  },
};

/** `rowActions` set — the extra "Actions" checkbox row `ColumnsPopover`
 * appends below the real columns (`docs/table/row-actions.md`'s
 * `ActionsDropdown` column is itself hideable, same as any other
 * optional column — see `TableBody.tsx`'s own render-actions-column
 * check). */
export const WithRowActions: Story = {
  render: () => <ColumnButtonHarness rowActions={() => null} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Toggle visible columns' }),
    );
    await waitFor(() => getDropdownItem('Actions'));
  },
};

/** `mode="grid"` disables the trigger — the popover has nothing to
 * configure in grid mode (no column list to show/hide), matching
 * `TableColumnsButton.tsx`'s own `disabled={mode !== 'table'}`. */
export const DisabledInGridMode: Story = {
  render: () => <ColumnButtonHarness mode="grid" />,
};
