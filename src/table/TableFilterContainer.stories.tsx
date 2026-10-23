import type { Meta, StoryObj } from '@storybook/react-vite';
import { screen, userEvent, waitFor, within } from 'storybook/test';

import {
  tableStoryActiveFilters,
  tableStoryFilters,
  tableStorySavedFilters,
} from './storyFixtures';
import { withSeededTableStore, withTableProviders } from './storyProviders';
import { TableFilterContainer } from './TableFilterContainer';
import { TableFilterSheet } from './TableFilterSheet';

/**
 * `TableFilterContainer` — the mobile/narrow-viewport filter layout, always
 * `filterPosition: "sidebar"` internally now (it used to also accept
 * `"header"`, an always-visible inline row for `<Table filterPosition=
 * "header">`, but no real caller ever paired that with `filters` — dead
 * code, removed). `Table.tsx`'s own `isSm` breakpoint check flips
 * `filterPosition` from `'menu'` to `'sidebar'`, and the table opens this
 * in its own `TableFilterSheet` — full width below lg, 500px from lg. So
 * unlike `Table.filtersAndLayout.stories.tsx`'s `MobileViewport`, these
 * don't need `globals.viewport`; what makes this "mobile" is the layout
 * itself (an accordion), not a narrower canvas.
 *
 * Each filter field renders through `TableSidebarFilterItem`
 * (TableFilterItem.tsx), a distinct component from the "menu" popover's
 * `TableMenuFilterItem` — a waldur-ui `AccordionItem` per filter, collapsed
 * by default, its field mounted only once expanded (Radix unmounts closed
 * panels; see that file for why this matters: every field mounting a
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

/** The panel as the table opens it (`BaseTable`'s `TableFilterSheet`): the
 * "Filters" header and `TableFilterActions`' Save / Cancel / Apply row, which
 * sits inside the filter context, so it saves under this `formId`.
 *
 * A saved filter is pre-selected (`selectedSavedFilter`) so
 * `SavedFilterSelect`'s own `Control` shows its delete-filter button and
 * the footer says "Update filter". */
export const AsFilterSheet: Story = {
  decorators: [
    withSeededTableStore(TABLE_ID, {
      savedFilters: tableStorySavedFilters,
      selectedSavedFilter: tableStorySavedFilters[1],
    }),
  ],
  render: () => (
    <TableFilterSheet
      panel={{ filters: tableStoryFilters, formId: FORM_ID }}
      onCancel={noop}
      onApply={noop}
      table={TABLE_ID}
      setFilter={noop}
    />
  ),
  play: async () => {
    await waitFor(() => screen.getByRole('heading', { name: 'Filters' }));
    await waitFor(() => screen.getByText('Update filter'));
  },
};
