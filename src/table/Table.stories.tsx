import type { Meta, StoryObj } from '@storybook/react-vite';

import { tableStoryBaseProps, TableStoryRow } from './storyFixtures';
import { withTableProviders } from './storyProviders';
import Table from './Table';

/**
 * Deterministic state-matrix coverage for `<Table>`, ahead of the planned
 * Bootstrap/Metronic -> Tailwind CSS port (see
 * docs/tailwind-shadcn-migration-notes.md). The goal of these stories is to
 * give the upcoming Playwright `toHaveScreenshot()` golden-master captures
 * something fixed to point at: every story below renders from the same
 * static fixtures (storyFixtures.tsx) with no randomness and no relative
 * time, so a baseline captured today diffs only on real rendering changes,
 * not on content drift.
 *
 * This file covers the base data states only (loading/empty/error/
 * populated) — everything else is grouped into sibling files under the
 * same "Data Display/Table" sidebar folder, split by concern rather than
 * left as one long flat list:
 * - `Table.rows.stories.tsx` — row actions, selection, hover, sorting, pinning
 * - `Table.expandableRow.stories.tsx` — every `ExpandableContainer` variant
 * - `Table.gridMode.stories.tsx` — card/grid display mode
 * - `Table.filtersAndLayout.stories.tsx` — filters, standalone/mobile layout
 * All five share `tableStoryBaseProps` (storyFixtures.tsx) rather than each
 * redefining it, and the same `withTableProviders` decorator below.
 *
 * `<Table>` is driven directly with hand-written props here, deliberately
 * bypassing `useTable()` — that hook pulls in Redux state selection, the
 * `@uirouter/react` singleton (via `getDefaultTitle()`), and react-query,
 * none of which these structural/visual stories need. `<Table>` itself
 * (`TableProvider`/`TableContext`) is presentational; only
 * `FilterContextProvider`'s bare `useDispatch()` call needs a Redux
 * `<Provider>` ancestor, supplied by `withTableProviders` (storyProviders.tsx,
 * also the source of `tableStoryNoopHandlers`, folded into
 * `tableStoryBaseProps` — every no-op callback prop `<Table>` needs a
 * working reference for regardless of what a given story is demonstrating).
 *
 * `useNotify` (`@/store/notify`) — used by the filters menu's saved-filter
 * actions and by `useTableExport` — is safe without any provider: it reads
 * a module-level callback set once at real app bootstrap and no-ops when
 * unset, rather than reading Redux or context. So `Table.filtersAndLayout
 * .stories.tsx`'s filter stories need nothing beyond this same decorator.
 *
 * Deliberately still out of scope for this pass: tabs (`TableTabs`/
 * `TableWithTabs`, needs the real `@uirouter/react` router singleton) and
 * the export button (`useTableExport` calls `getTableOptions(table)`,
 * which reads a module-level registry only the real `useTable()` hook
 * populates via `registerTable()` — these stories bypass `useTable()`
 * entirely, so an unregistered table id there throws). Both tracked
 * separately.
 */
const meta: Meta<typeof Table<TableStoryRow>> = {
  title: 'Data Display/Table',
  component: Table,
  decorators: [withTableProviders],
};
export default meta;

type Story = StoryObj<typeof Table<TableStoryRow>>;

/** The default, fully populated state — also exercises pagination (4 of 11
 * shown, page 1 of 3), the standard case most other stories are a variant
 * of. */
export const Populated: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      pagination={{ ...tableStoryBaseProps.pagination, resultCount: 11 }}
    />
  ),
};

/** Initial load: no rows yet, so the full-height spinner renders instead of
 * the row-level refetch overlay (see `Refetching` below for that state). */
export const Loading: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      rows={[]}
      loading={true}
      pagination={{ ...tableStoryBaseProps.pagination, resultCount: 0 }}
    />
  ),
};

/** A background refetch with existing rows on screen: dims the current
 * content (`.table-content-refetching`) and overlays a small spinner,
 * rather than replacing the table with the full loading state. */
export const Refetching: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      loading={true}
      pagination={{ ...tableStoryBaseProps.pagination, resultCount: 11 }}
    />
  ),
};

/** No rows, not loading — the empty-state placeholder. */
export const Empty: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      rows={[]}
      firstFetch={false}
      pagination={{ ...tableStoryBaseProps.pagination, resultCount: 0 }}
    />
  ),
};

/** A failed fetch — renders `ErrorView` instead of any row content. */
export const ErrorState: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      rows={[]}
      error={{ message: 'Failed to load clusters' }}
      pagination={{ ...tableStoryBaseProps.pagination, resultCount: 0 }}
    />
  ),
};
