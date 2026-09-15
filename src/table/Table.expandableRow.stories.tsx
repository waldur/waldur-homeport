import type { Meta, StoryObj } from '@storybook/react-vite';

import { Field } from '@/resource/summary';

import { ExpandableContainer } from './ExpandableContainer';
import {
  tableStoryBaseProps,
  tableStoryRows,
  TableStoryExpandableRow,
  TableStoryNestedExpandableRow,
  TableStoryRow,
} from './storyFixtures';
import { withTableProviders } from './storyProviders';
import Table from './Table';

/**
 * Every `ExpandableContainer` variant — the piece most at risk in the
 * Tailwind port, since its width math (`ExpandableContainer.scss`) computes
 * off a literal `100vw` minus fixed aside/sidebar offsets, assuming
 * Metronic's real aside is present. Storybook has no aside at all, so the
 * computed width in the default `ExpandableRow` story below is expected to
 * run narrower than it would in the real app — that mismatch is the actual
 * risk these stories exist to make visible, not a bug in them. See
 * `ExpandableRowFluid` for the opt-out real narrow-context callers (a
 * modal, a side panel) already use to sidestep it.
 *
 * Sibling of `Table.stories.tsx` (base data states); see that file's own
 * comment for why this is a separate file/sidebar group, and for
 * `tableStoryBaseProps`/`withTableProviders`'s origin.
 */
const meta: Meta<typeof Table<TableStoryRow>> = {
  title: 'Data Display/Table/Expandable Row',
  component: Table,
  decorators: [withTableProviders],
};
export default meta;

type Story = StoryObj<typeof Table<TableStoryRow>>;

/** One row pre-expanded, showing `ExpandableContainer`'s default flow
 * layout. */
export const ExpandableRow: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      toggled={{ [tableStoryRows[0].uuid]: true }}
      expandableRow={({ row }) => <TableStoryExpandableRow row={row} />}
    />
  ),
};

/** The `.as-table` layout variant — `ExpandableContainer`'s field-grid CSS
 * branch, used where the expanded detail reads better as aligned
 * label/value columns than the default flow layout (see
 * `CreditExpandableRow.tsx`, the pattern this mirrors). */
export const ExpandableRowAsTable: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      toggled={{ [tableStoryRows[0].uuid]: true }}
      expandableRow={({ row }) => <TableStoryExpandableRow row={row} asTable />}
    />
  ),
};

/** Expandable rows combined with multi-select — `ExpandableContainer`'s
 * `.has-multiselect` CSS branch shifts the expanded panel's left margin to
 * clear the checkbox column, on top of the arrow column it always clears. */
export const ExpandableRowWithMultiSelect: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      toggled={{ [tableStoryRows[0].uuid]: true }}
      enableMultiSelect
      expandableRow={({ row }) => (
        <TableStoryExpandableRow row={row} hasMultiSelect />
      )}
    />
  ),
};

/** A nested table inside the expanded row — `ExpandableContainer.scss`'s
 * `.card-table` branch (distinct thead/tbody background tokens, pinned-
 * column background overrides), the pattern `RoleUsersExpandableRow.tsx`
 * uses for e.g. a role's list of granted users. */
export const ExpandableRowNestedTable: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      toggled={{ [tableStoryRows[0].uuid]: true }}
      expandableRow={() => <TableStoryNestedExpandableRow />}
    />
  ),
};

/** Two rows expanded at once — `toggled` is a per-row map, not a single
 * selection, so this is a real reachable state, not a hypothetical one.
 * Checks the expanded panels stack without overlapping or collapsing the
 * spacing between their owning rows. */
export const ExpandableRowMultipleExpanded: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      toggled={{
        [tableStoryRows[0].uuid]: true,
        [tableStoryRows[2].uuid]: true,
      }}
      expandableRow={({ row }) => <TableStoryExpandableRow row={row} />}
    />
  ),
};

/** The `fluid` opt-out (`ExpandableContainer.scss`'s `table .expandable-
 * container.fluid` rule) — for a table that doesn't span the full content
 * area (a proposal panel beside a progress rail, a modal), where the
 * viewport-relative width math in the default `ExpandableRow` story would
 * push columns behind an unnecessary horizontal scroll. Wrapped in a
 * narrow container to make the point visible: compare against
 * `ExpandableRow` at the same viewport width. */
export const ExpandableRowFluid: Story = {
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 500 }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Table
      {...tableStoryBaseProps}
      toggled={{ [tableStoryRows[0].uuid]: true }}
      expandableRow={({ row }) => (
        <ExpandableContainer className="fluid">
          <Field label="Region" value={row.region} />
          <Field label="Plan" value={row.plan} />
        </ExpandableContainer>
      )}
    />
  ),
};
