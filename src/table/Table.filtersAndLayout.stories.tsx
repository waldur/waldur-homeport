import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  tableStoryActiveFilters,
  tableStoryBaseProps,
  tableStoryFilters,
  TableStoryRow,
} from './storyFixtures';
import { withTableProviders } from './storyProviders';
import Table from './Table';

/**
 * Filters and page-layout variants that don't fit the other grouped files —
 * embedded/standalone mode, the responsive viewport collapse. Sibling of
 * `Table.stories.tsx` (base data states); see that file's own comment for
 * why this is a separate file/sidebar group, and for
 * `tableStoryBaseProps`/`withTableProviders`'s origin.
 *
 * `useNotify` (`@/store/notify`), used by the filters menu's saved-filter
 * actions, is safe without any provider: it reads a module-level callback
 * set once at real app bootstrap and no-ops when unset, rather than reading
 * Redux or context. So `Filterable`/`WithActiveFilters` below need nothing
 * beyond `withTableProviders`.
 */
const meta: Meta<typeof Table<TableStoryRow>> = {
  title: 'Data Display/Table/Filters & Layout',
  component: Table,
  decorators: [withTableProviders],
};
export default meta;

type Story = StoryObj<typeof Table<TableStoryRow>>;

/** The default "menu" filter position with real filter fields wired in
 * (`StringFilter`/`BooleanFilter`), no filter applied yet — the filter
 * button/popover trigger's own state. See `TableFiltersMenu.stories.tsx`
 * for the popover's own content opened. */
export const Filterable: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      filters={tableStoryFilters}
      filtersStorage={[]}
    />
  ),
};

/** One filter chip already applied — the "Clear filters" affordance next
 * to it, and the chip's own value-badge-plus-remove-button rendering. */
export const WithActiveFilters: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      filters={tableStoryFilters}
      filtersStorage={tableStoryActiveFilters}
    />
  ),
};

/** Embedded mode — e.g. nested inside a details panel or a modal — hides
 * the title bar per CLAUDE.md's nested-table guidance. */
export const StandaloneMode: Story = {
  render: () => (
    <Table {...tableStoryBaseProps} standalone hideTitle hasActionBar={false} />
  ),
};

/** The default populated state at the app's own "Mobile (xs)" viewport
 * preset — the responsive collapse most at risk of drifting during the
 * Tailwind port.
 *
 * `globals`, not `parameters`: Storybook 10's core viewport feature moved
 * viewport selection to a global (toolbar-driven runtime state), and reads
 * its custom preset list from `parameters.viewport.options` — not
 * `parameters.viewport.defaultViewport` / `.viewports`, the old
 * addon-viewport (Storybook 6/7) API `.storybook/preview.tsx` was
 * (silently, no error) still written against. Fixed there too — see that
 * file's own comment and `node_modules/storybook/dist/chunk-*.d.ts`'s
 * `ViewportParameters`/`ViewportGlobals` types for the confirmed shape. */
export const MobileViewport: Story = {
  globals: { viewport: 'mobile' },
  render: () => (
    <Table
      {...tableStoryBaseProps}
      pagination={{ ...tableStoryBaseProps.pagination, resultCount: 11 }}
    />
  ),
};
