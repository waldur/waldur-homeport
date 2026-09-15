import type { Meta, StoryObj } from '@storybook/react-vite';
import { screen, userEvent, waitFor, within } from 'storybook/test';

import { FilterContextProvider } from './FilterContextProvider';
import { tableStoryFilters, tableStorySavedFilters } from './storyFixtures';
import { withSeededTableStore } from './storyProviders';
import { TableFiltersMenu } from './TableFiltersMenu';
import { FilterItem } from './types';

/**
 * `TableFiltersMenu` — the "Add filter" popover (or, with `openName` set,
 * a single column's funnel-icon flyout) — is one of the few pieces in
 * `src/table` that genuinely needs seeded Redux state, not just props:
 * `SaveFilterItems`/`SavedFilterSelect` inside it read saved filters and
 * applied-filter values via `useSelector(selectTableSavedFilters(...))` /
 * `selectFilterValues(...)`, straight from `tables[table]` in the store —
 * bypassing whatever `filtersStorage` prop is passed alongside. So unlike
 * every other story in this module (plain props, a bare no-op Redux
 * `Provider`), these use `withSeededTableStore` (storyProviders.tsx) — a
 * real `redux-mock-store` seeded with the table state those selectors
 * actually read, paired with `ModalProvider` (also needed here — the
 * "Save as" dialog trigger calls `useModal()`). `redux-mock-store` doesn't
 * re-run reducers on dispatch, which is fine here — these are static,
 * deterministic fixture states, not interactive demos. Each story passes
 * its own seed via a per-story `decorators` array (composed *around*
 * `meta`'s own, not instead of it — Storybook applies both).
 *
 * The popover itself is closed by default (real component state, not a
 * prop) — each story's `play` function clicks it open, the same pattern
 * `packages/ui/src/Sidebar/Sidebar.stories.tsx` already uses. The trigger
 * button lives inside `canvasElement` (`within(canvasElement)` finds it
 * fine), but the popover's own content is Radix-portaled out to
 * `document.body` (`getFilterMenuPortalContainer()` in TableFiltersMenu.tsx
 * falls back to it — there's no `#kt_content_container` in Storybook) —
 * a sibling of `canvasElement` in the DOM, not a descendant. Every
 * assertion against the opened content below uses the global `screen`
 * query for that reason; `within(canvasElement)` would never find it.
 */
const TABLE_ID = 'story-filters-menu';
const FORM_ID = 'story-filters-form';

const noop = () => undefined;

const appliedFilterFixtures: FilterItem[] = [
  { name: 'name', label: 'Name', value: 'production', component: null },
];

const FiltersMenuHarness = ({ openName }: { openName?: string }) => (
  <FilterContextProvider
    table={TABLE_ID}
    filters={tableStoryFilters}
    formId={FORM_ID}
    filterPosition="menu"
    setFilter={noop}
    applyFiltersFn={noop}
    selectedSavedFilter={null}
  >
    <div style={{ minHeight: 360 }}>
      <TableFiltersMenu
        table={TABLE_ID}
        filters={tableStoryFilters}
        formId={FORM_ID}
        filterPosition="menu"
        filtersStorage={[]}
        setFilter={noop}
        applyFiltersFn={noop}
        openName={openName}
      />
    </div>
  </FilterContextProvider>
);

const meta: Meta<typeof FiltersMenuHarness> = {
  title: 'Data Display/Table/TableFiltersMenu',
  component: FiltersMenuHarness,
};
export default meta;

type Story = StoryObj<typeof FiltersMenuHarness>;

/** The "Add filter" list, opened — no saved filters, nothing applied yet:
 * just the real filter fields (`StringFilter`/`BooleanFilter`) and the
 * "Saved filters (0)" row. */
export const Open: Story = {
  decorators: [withSeededTableStore(TABLE_ID)],
  render: () => <FiltersMenuHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Add filter' }));
    // screen, not canvas: this content is portaled — see file comment.
    // Not getByText either: "Saved filters (0)" is nested (an outer
    // role="button" span wrapping an inner .menu-title span), and both
    // count as separate text matches under RTL's default text-content
    // matching. getByRole's accessible-name computation collapses that
    // nesting into one name.
    await waitFor(() => screen.getByRole('button', { name: /Saved filters/ }));
  },
};

/** The "Saved filters" flyout, expanded — `SavedFilterSelect`'s own
 * `WindowedSelect` list of previously saved filter groups, read from
 * Redux state a real save would have written. */
export const WithSavedFilters: Story = {
  decorators: [
    withSeededTableStore(TABLE_ID, { savedFilters: tableStorySavedFilters }),
  ],
  render: () => <FiltersMenuHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Add filter' }));
    const savedFiltersRow = await screen.findByRole('button', {
      name: /Saved filters \(2\)/,
    });
    await userEvent.click(savedFiltersRow);
    // The select control itself renders immediately, but react-select
    // doesn't put its options in the DOM until its own menu is opened —
    // a separate interaction from opening the flyout that contains it.
    // Its input carries role="combobox" in the DOM, but dom-testing-
    // library's role query doesn't resolve it as one (react-select's
    // combobox wiring doesn't fully match the ARIA combobox pattern it
    // expects) — click the placeholder text instead, which sits inside
    // the same control and triggers react-select's default
    // openMenuOnClick.
    const select = await screen.findByText('Select saved filter');
    await userEvent.click(select);
    await waitFor(() => screen.getByText('My production view'));
  },
};

/** The "Current filters" flyout, expanded — appears only once at least one
 * filter has a real value (`hasFiltersApplied`, derived from Redux state,
 * same as `WithSavedFilters`). Offers "Save as" (and, once a saved filter
 * is selected/edited, "Update" — not shown here since none is selected). */
export const WithCurrentFiltersApplied: Story = {
  decorators: [
    withSeededTableStore(TABLE_ID, { filtersStorage: appliedFilterFixtures }),
  ],
  render: () => <FiltersMenuHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Add filter' }));
    const currentFiltersRow = await screen.findByRole('button', {
      name: 'Current filters',
    });
    await userEvent.click(currentFiltersRow);
    // Not a bare getByText: "Save as" is `aria-hidden` (so getByRole can't
    // find it) and, like "Saved filters (0)" above, nested — an outer
    // .menu-link span wraps an inner .menu-title span with identical text
    // content, so an unscoped match is ambiguous between the two.
    await waitFor(() =>
      screen.getByText('Save as', { selector: '.menu-title' }),
    );
  },
};

/** The other instance of this same component: a single column's funnel-icon
 * toggle (`openName` set to a filter's `name`), opened — shows just that
 * one filter's field, not the whole "Add filter" list. Matches
 * `TableHeader.tsx`'s per-column filter icon, not the toolbar's "+"
 * button. */
export const ColumnFilterToggle: Story = {
  decorators: [withSeededTableStore(TABLE_ID)],
  render: () => <FiltersMenuHarness openName="name" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Filter by column' }),
    );
    await waitFor(() => screen.getByPlaceholderText('Search by name'));
  },
};
