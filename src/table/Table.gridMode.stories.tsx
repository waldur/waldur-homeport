import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  tableStoryBaseProps,
  TableStoryCompactGridItem,
  TableStoryGridItem,
  TableStoryRow,
} from './storyFixtures';
import { withTableProviders } from './storyProviders';
import Table from './Table';

/**
 * Card/grid display mode instead of the default table layout. Sibling of
 * `Table.stories.tsx` (base data states); see that file's own comment for
 * why this is a separate file/sidebar group, and for
 * `tableStoryBaseProps`/`withTableProviders`'s origin.
 */
const meta: Meta<typeof Table<TableStoryRow>> = {
  title: 'Data Display/Table/Grid Mode',
  component: Table,
  decorators: [withTableProviders],
};
export default meta;

type Story = StoryObj<typeof Table<TableStoryRow>>;

/** The responsive breakpoint pattern real `gridItem` call sites actually
 * use (`md:grid-cols-2 xl:grid-cols-3` — `ProjectsList.tsx`/
 * `OrganizationsList.tsx` and others set this same pair). */
export const GridMode: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      mode="grid"
      gridItem={TableStoryGridItem}
      gridClassName="md:grid-cols-2 xl:grid-cols-3"
    />
  ),
};

/** `gridFixedWidth` — the CSS Grid layout variant (`Table.scss`'s
 * `.grid-fixed-width`, `repeat(auto-fill, minmax(400px, 1fr))`) instead of
 * the default responsive grid, matching `ProjectsList.tsx`. Card
 * count and container width together decide the column count here, not
 * `gridClassName` (ignored by `GridBody.tsx` whenever `gridFixedWidth` is set). */
export const GridModeFixedWidth: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      mode="grid"
      gridItem={TableStoryGridItem}
      gridFixedWidth
    />
  ),
};

/** Full-width, no-gutter cards (`gridClassName="gap-0"`) —
 * `UserPendingActionsList`'s dashboard pattern, and the other real
 * `gridItem` shape besides `ModelCard1`: `AlertItem`
 * (`TableStoryCompactGridItem`, simplified from `PendingActionAlertItem.tsx`
 * — see its own comment in storyFixtures.tsx). */
export const GridModeCompact: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      mode="grid"
      gridItem={TableStoryCompactGridItem}
      gridClassName="gap-0"
    />
  ),
};

/** A background refetch in grid mode — `grid-hover-shadow`/
 * `table-content-refetching` applied to the card container rather than a
 * `<table>`, the one loading/empty-adjacent state that's actually
 * grid-specific (the plain loading spinner and empty placeholder render
 * identically to table mode — see `TableContent.tsx`: both checks run
 * before the mode branch). */
export const GridModeRefetching: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      loading={true}
      mode="grid"
      gridItem={TableStoryGridItem}
      gridClassName="md:grid-cols-2 xl:grid-cols-3"
    />
  ),
};

/** `gridFixedWidth` at the "Mobile (xs)" viewport — `Table.scss`'s
 * `@media (max-width: 575px) { grid-template-columns: 1fr }` collapses the
 * CSS Grid to a single column. */
export const GridModeMobile: Story = {
  globals: { viewport: 'mobile' },
  render: () => (
    <Table
      {...tableStoryBaseProps}
      mode="grid"
      gridItem={TableStoryGridItem}
      gridFixedWidth
    />
  ),
};
