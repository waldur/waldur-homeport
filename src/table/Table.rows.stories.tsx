import type { Meta, StoryObj } from '@storybook/react-vite';

import { ActionItem } from '@/resource/actions/ActionItem';

import { ActionsDropdown } from './ActionsDropdown';
import {
  tableStoryBaseProps,
  tableStoryColumns,
  tableStoryRows,
  tableStoryWideColumns,
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

/** Multi-select enabled, with one row pre-selected. */
export const MultiSelect: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      enableMultiSelect
      selectedRows={[tableStoryRows[0]]}
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
