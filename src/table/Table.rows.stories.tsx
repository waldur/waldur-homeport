import type { Meta, StoryObj } from '@storybook/react-vite';

import { ActionItem } from '@/resource/actions/ActionItem';

import { ActionsDropdown } from './ActionsDropdown';
import {
  tableStoryBaseProps,
  tableStoryColumns,
  tableStoryRows,
  tableStoryWideColumns,
  TableStoryBulkDeleteButton,
  TableStoryInlineRowActions,
  TableStoryRow,
} from './storyFixtures';
import { withTableProviders } from './storyProviders';
import Table from './Table';

/**
 * Row- and column-level features — actions, selection, hover, sorting,
 * pinning. Sibling of `Table.stories.tsx` (base data states); see that
 * file's own comment for why this is a separate file/sidebar group rather
 * than more exports in one long list, and for `tableStoryBaseProps`/
 * `withTableProviders`'s origin.
 */
const meta: Meta<typeof Table<TableStoryRow>> = {
  title: 'Data Display/Table/Rows',
  component: Table,
  decorators: [withTableProviders],
};
export default meta;

type Story = StoryObj<typeof Table<TableStoryRow>>;

const noop = () => undefined;

/** Row-level actions via the standard `ActionsDropdown` + `ActionItem`
 * pattern (see CLAUDE.md's Row actions rule) — the composed, real-world
 * shape most production tables actually use. */
export const WithRowActions: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      rowActions={() => (
        <ActionsDropdown>
          <ActionItem title="Edit" action={noop} />
          <ActionItem title="Delete" action={noop} className="text-danger" />
        </ActionsDropdown>
      )}
    />
  ),
};

/** A disabled row action carrying its explanatory tooltip — see CLAUDE.md's
 * "Disabled buttons MUST have tooltip" rule. */
export const DisabledRowAction: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      rowActions={() => (
        <ActionsDropdown>
          <ActionItem title="Edit" action={noop} />
          <ActionItem
            title="Delete"
            action={noop}
            disabled
            tooltip="Resource is still provisioning"
          />
        </ActionsDropdown>
      )}
    />
  ),
};

/** Multi-select enabled, with one row pre-selected. No `multiSelectActions`
 * — a real, if less common, configuration: `enableMultiSelect` alone is
 * used where selection itself is the point (e.g. a form-field-style
 * picker), not every real call site pairs it with a bulk-action toolbar
 * (see `EditEndDateDialog.tsx`/`Step2SelectOfferings.tsx`). See
 * `MultiSelectWithBulkActions` below for the toolbar itself. */
export const MultiSelect: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      enableMultiSelect
      selectedRows={[tableStoryRows[0]]}
    />
  ),
};

/** The bulk-action toolbar `multiSelectActions` renders — only appears once
 * `selectedRows.length > 0` (`TableToolbar.tsx`), so `MultiSelect` above,
 * despite its name, never actually shows it. `TableStoryBulkDeleteButton`
 * mirrors `docs/table/row-actions.md`'s own `BulkDeleteButton` reference
 * example almost verbatim — a bare `RemovalActionButton`, not nested in a
 * dropdown (compare `ActionDropdownButton`-wrapped multi-action menus like
 * `BatchProjectActions.tsx`, a heavier real pattern this doesn't attempt to
 * cover). */
export const MultiSelectWithBulkActions: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      enableMultiSelect
      selectedRows={[tableStoryRows[0], tableStoryRows[2]]}
      multiSelectActions={TableStoryBulkDeleteButton}
    />
  ),
};

/** Whole rows clickable, not just their content — the row-hover affordance
 * `hoverable` adds. */
export const HoverableRow: Story = {
  render: () => <Table {...tableStoryBaseProps} hoverable onRowClick={noop} />,
};

/** A column sorted ascending — the header's sort arrow state.
 * `TableHeader.tsx` only renders sort controls for a column that declares
 * `orderField` (checked directly, not implied by `sorting` alone), so this
 * story uses its own column list with `orderField` set on `name` rather
 * than the shared `tableStoryColumns` (which deliberately doesn't, so the
 * other stories don't show sort carets they're not demonstrating). */
export const Sorted: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      columns={tableStoryColumns.map((column) =>
        column.id === 'name' ? { ...column, orderField: 'name' } : column,
      )}
      sorting={{ field: 'name', mode: 'asc', loading: false }}
    />
  ),
};

/** The `name` column pinned (sticky) to the left edge while scrolling.
 * Uses `tableStoryWideColumns`, not the shared 4-column set — pinning has
 * nothing to demonstrate without a horizontal scrollbar, and the narrow
 * default columns fit most viewports unscrolled. */
export const PinnedColumn: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      columns={tableStoryWideColumns}
      pinnedColumnKeys={['name']}
    />
  ),
};

/** The documented alternative to the `ActionsDropdown` 3-dots menu for a
 * very short action list — `CompactActionButton`s rendered directly in the
 * row (`docs/table/row-actions.md`'s "Inline Row Action Buttons"). */
export const InlineRowActions: Story = {
  render: () => (
    <Table {...tableStoryBaseProps} rowActions={TableStoryInlineRowActions} />
  ),
};
