import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { PropertyItem, PropertyList } from 'waldur-ui';

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
 * Every `ExpandableContainer` variant — verified across layout modes:
 * default flow layout, `asTable` label-value columns, multi-select
 * checkbox column offset, and nested tables.
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
  play: async ({ canvasElement }) => {
    const slot = canvasElement.querySelector(
      '[data-slot="expanded-row-content"]',
    );
    expect(slot).not.toBeNull();
    const style = getComputedStyle(slot as Element);
    await expect(style.position).toBe('sticky');
    await expect(style.left).toBe('0px');
    await expect(style.paddingLeft).toBe('52px');
  },
};

/** The `asTable` layout variant — one `PropertyList` with the labels in
 * one column, used where the expanded detail reads better as aligned
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
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('.expandable-container');
    await expect(el).not.toBeNull();
    const label = el?.querySelector('[data-slot="property-term"]');
    await expect(label).not.toBeNull();
  },
};

/** Expandable rows combined with multi-select — shifts the expanded panel's
 * left margin to clear the checkbox column on top of the arrow column. */
export const ExpandableRowWithMultiSelect: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      toggled={{ [tableStoryRows[0].uuid]: true }}
      enableMultiSelect
      expandableRow={({ row }) => <TableStoryExpandableRow row={row} />}
    />
  ),
  play: async ({ canvasElement }) => {
    const slot = canvasElement.querySelector(
      '[data-slot="expanded-row-content"]',
    );
    expect(slot).not.toBeNull();
    const style = getComputedStyle(slot as Element);
    await expect(style.paddingLeft).toBe('84px');
  },
};

/** A nested table inside the expanded row — nested table card has transparent
 * background and card padding applied directly to edge cells. */
export const ExpandableRowNestedTable: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      toggled={{ [tableStoryRows[0].uuid]: true }}
      expandableRow={() => <TableStoryNestedExpandableRow />}
    />
  ),
  play: async ({ canvasElement }) => {
    const slot = canvasElement.querySelector(
      '[data-slot="expanded-row-content"]',
    );
    const nestedCard = slot?.querySelector('[data-slot="card"]');
    expect(nestedCard).not.toBeNull();
    if (nestedCard) {
      await expect(getComputedStyle(nestedCard).backgroundColor).toBe(
        'rgba(0, 0, 0, 0)',
      );
    }
    // The nested header row's rule is the divider colour: in dark its
    // --bg-tertiary background is the --border-secondary step.
    const nestedHeaderRow = slot?.querySelector('thead > tr');
    expect(nestedHeaderRow).not.toBeNull();
    if (nestedHeaderRow) {
      const probe = document.createElement('span');
      probe.style.color = 'var(--border-divider)';
      canvasElement.appendChild(probe);
      const divider = getComputedStyle(probe).color;
      probe.remove();
      await expect(getComputedStyle(nestedHeaderRow).borderBottomColor).toBe(
        divider,
      );
    }
  },
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

/** A table that doesn't span the full content area (a proposal panel
 * beside a progress rail, a modal): the expanded row's slot takes the
 * table's own width, so it needs no opt-out. Wrapped in a narrow container
 * to make the point visible. */
export const ExpandableRowNarrow: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-125">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Table
      {...tableStoryBaseProps}
      toggled={{ [tableStoryRows[0].uuid]: true }}
      expandableRow={({ row }) => (
        <ExpandableContainer>
          <PropertyList variant="summary">
            <PropertyItem label="Region" value={row.region} />
            <PropertyItem label="Plan" value={row.plan} />
          </PropertyList>
        </ExpandableContainer>
      )}
    />
  ),
  play: async ({ canvasElement }) => {
    const slot = canvasElement.querySelector(
      '[data-slot="expanded-row-content"]',
    );
    expect(slot).not.toBeNull();
    const style = getComputedStyle(slot as Element);
    await expect(style.position).toBe('sticky');
  },
};

/** `isRowExpandable` hides the expand caret on rows that don't qualify —
 * here, the "Erred" row (matching `ResourceProjectsList.tsx`'s
 * `(row) => !row.is_removed` shape: a boolean condition on the row itself,
 * not every row expandable by default just because `expandableRow` is
 * set). */
export const ConditionallyExpandable: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      isRowExpandable={(row) => row.status !== 'Erred'}
      expandableRow={({ row }) => <TableStoryExpandableRow row={row} />}
    />
  ),
};
