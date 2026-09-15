import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { screen, userEvent, waitFor, within } from 'storybook/test';

import { useDrawer } from '@/drawer/actions';
import { DrawerProvider } from '@/drawer/DrawerContext';
import { DrawerRoot } from '@/drawer/DrawerRoot';
import { translate } from '@/i18n';

import {
  tableStoryActiveFilters,
  tableStoryFilters,
  tableStorySavedFilters,
} from './storyFixtures';
import { withSeededTableStore, withTableProviders } from './storyProviders';
import { TableFilterActions } from './TableFilterActions';
import { TableFilterContainer } from './TableFilterContainer';

/**
 * `TableFilterContainer` — the mobile/narrow-viewport filter layout, always
 * `filterPosition: "sidebar"` internally now (it used to also accept
 * `"header"`, an always-visible inline row for `<Table filterPosition=
 * "header">`, but no real caller ever paired that with `filters` — dead
 * code, removed). `Table.tsx`'s own `isSm` breakpoint check flips
 * `filterPosition` from `'menu'` to `'sidebar'` and opens this inside a
 * drawer (`useTable()`'s `renderFiltersDrawer`/`openFiltersDrawer`, via
 * `useDrawer()`) — a fixed 500px-wide panel (`openFiltersDrawer`'s own
 * `width: '500px'`, matched by the wrapper below), not something that
 * scales with the real viewport. So unlike `Table.filtersAndLayout
 * .stories.tsx`'s `MobileViewport`, these don't need `globals.viewport` —
 * the drawer is the same fixed width regardless of screen size; what makes
 * this "mobile" is the layout itself (an accordion), not a narrower canvas.
 *
 * Each filter field renders through `TableSidebarFilterItem`
 * (TableFilterItem.tsx), a distinct component from the "menu" popover's
 * `TableMenuFilterItem` — an `Accordion.Item` per filter, collapsed by
 * default, its field deferred-mounted until actually expanded (a real,
 * documented fix in that file: react-bootstrap's `Accordion.Body` mounts
 * on render regardless of collapsed state, and every field mounting a
 * react-select at once — each with its own forced `autoFocus` — starved
 * the main thread for over a second).
 *
 * Redux is required (not just props): `SavedFilterSelect` reads
 * `selectTableSavedFilters`/`selectFilterValues` straight from the store
 * (see `TableFiltersMenu.stories.tsx`'s own file comment for the same
 * pattern), so `SidebarWithSavedFilters` below uses `withSeededTableStore`
 * (storyProviders.tsx) instead of the bare no-op `withTableProviders`.
 */
const TABLE_ID = 'story-filter-container';
const FORM_ID = 'story-filter-container-form';
const noop = () => undefined;

const meta: Meta<typeof TableFilterContainer> = {
  title: 'Data Display/Table/TableFilterContainer (Mobile)',
  component: TableFilterContainer,
};
export default meta;

type Story = StoryObj<typeof TableFilterContainer>;

/** Collapsed by default — no saved filters, nothing applied. */
export const Sidebar: Story = {
  decorators: [withTableProviders],
  render: () => (
    <div style={{ width: 500 }}>
      <TableFilterContainer
        table={TABLE_ID}
        formId={FORM_ID}
        filters={tableStoryFilters}
        setFilter={noop}
      />
    </div>
  ),
};

/** One filter's row expanded, with a value already applied — shows the
 * accordion's real field mount (not just its collapsed header) and the
 * pre-filled `StringField` input, since `TableSidebarFilterItem` reads its
 * current value from the same seeded Redux state `SavedFilterSelect` does. */
export const SidebarExpanded: Story = {
  decorators: [
    withSeededTableStore(TABLE_ID, { filtersStorage: tableStoryActiveFilters }),
  ],
  render: () => (
    <div style={{ width: 500 }}>
      <TableFilterContainer
        table={TABLE_ID}
        formId={FORM_ID}
        filters={tableStoryFilters}
        setFilter={noop}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Name'));
    await waitFor(() => screen.getByDisplayValue('production'));
  },
};

/** The saved-filters select above the accordion, with real saved filter
 * groups to pick from — the same fixtures `TableFiltersMenu.stories.tsx`'s
 * `WithSavedFilters` uses, since both surfaces read the identical Redux
 * state through `SavedFilterSelect`. */
export const SidebarWithSavedFilters: Story = {
  decorators: [
    withSeededTableStore(TABLE_ID, { savedFilters: tableStorySavedFilters }),
  ],
  render: () => (
    <div style={{ width: 500 }}>
      <TableFilterContainer
        table={TABLE_ID}
        formId={FORM_ID}
        filters={tableStoryFilters}
        setFilter={noop}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = await canvas.findByText('Select saved filter');
    await userEvent.click(select);
    await waitFor(() => screen.getByText('My production view'));
  },
};

/** Mirrors `useTable()`'s real `openFiltersDrawer` call exactly: this
 * component is never actually mounted bare in production the way the
 * stories above render it — it's always opened through `useDrawer()` into
 * the real `DrawerRoot` (`DrawerRoot.tsx`), which supplies the "Filters" /
 * "Apply filters to table data" header and, from `drawerProps.footer`,
 * `TableFilterActions`'s "Update filter" / Cancel / Apply row — the actual
 * chrome a user sees, not just the bare accordion the stories above
 * isolate. `DrawerRoot` renders the body and footer as *siblings*, each
 * `React.createElement`d straight from `drawerProps` — not nested inside
 * one another — so `TableFilterActions` never sees `TableFilterContainer`'s
 * own `TableFilterContext.Provider`; its `context.form` read falls back to
 * `''`. That's real production behavior (every caller hits the same
 * DrawerRoot), not something specific to this story.
 *
 * A saved filter is pre-selected (`selectedSavedFilter`) so
 * `SavedFilterSelect`'s own `Control` shows its delete-filter button too —
 * only rendered once `getValue()[0]` is truthy (see that file's own
 * `Control` component) — which `Sidebar`/`SidebarExpanded`/
 * `SidebarWithSavedFilters` above never trigger. */
const FilterDrawerHarness = () => {
  const { openDrawer } = useDrawer();
  useEffect(() => {
    openDrawer(TableFilterContainer, {
      title: translate('Filters'),
      subtitle: translate('Apply filters to table data'),
      width: '500px',
      table: TABLE_ID,
      filters: tableStoryFilters,
      formId: FORM_ID,
      setFilter: noop,
      apply: noop,
      footer: TableFilterActions,
    });
    // Real usage (useTable.ts's openFiltersDrawer) fires this from a click
    // handler, once — an empty dep array here matches that "once" intent
    // for this story's own one-shot auto-open, not a missing-dependency bug.
  }, []);
  return <DrawerRoot />;
};

export const AsFilterDrawer: Story = {
  decorators: [
    withSeededTableStore(TABLE_ID, {
      savedFilters: tableStorySavedFilters,
      selectedSavedFilter: tableStorySavedFilters[1],
    }),
  ],
  render: () => (
    <DrawerProvider>
      <FilterDrawerHarness />
    </DrawerProvider>
  ),
  play: async () => {
    await waitFor(() => screen.getByRole('heading', { name: 'Filters' }));
    await waitFor(() => screen.getByText('Update filter'));
  },
};
