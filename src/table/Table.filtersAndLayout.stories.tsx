import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  tableStoryActiveFilters,
  tableStoryBaseProps,
  tableStoryColumns,
  tableStoryFilters,
  tableStoryFiltersWithSelect,
  tableStoryRows,
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

/** A `SelectFilter` (fixed-options dropdown) alongside the string/boolean
 * fields already covered elsewhere — real filter lists commonly mix field
 * types (see `UserAffiliationsFilter.tsx`). */
export const WithSelectFilter: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      filters={
        <>
          {tableStoryFilters}
          {tableStoryFiltersWithSelect}
        </>
      }
      filtersStorage={[]}
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

/** Inline cell-click filtering (`docs/table/filters.md`'s "Inline Filters")
 * — hovering the "Name" cell reveals a funnel icon; clicking it adds a
 * "name" filter using that row's own value, without opening the filter
 * menu. `TableBody.tsx`'s `hasFilterMenu()` gates the icon on a real DOM
 * query, `#kt_content_container .table-filters-menu #filter-item-{key}` —
 * a hardcoded selector (Metronic's own pre-Radix markup assumption, never
 * updated), not a React prop check. Real app pages always have
 * `#kt_content_container` as their content wrapper; Storybook doesn't, so
 * this story adds it by hand — omit it and the icon silently never
 * appears, exactly as it would if this table were rendered outside the
 * real page shell. `filters={tableStoryFilters}` is what makes
 * `#filter-item-name` exist in the first place (`TableFiltersMenu`'s
 * "Add filter" list `forceMount`s its content regardless of open state —
 * see that file's own comment).
 *
 * That DOM query runs synchronously during `TableCell`'s render, and
 * `TableCell`/`TableCells`/`TableBody` are all `memo`'d — so the query's
 * *first* result (necessarily `false`; nothing has committed to the DOM
 * during a render pass) sticks forever unless some later render hands
 * `TableCell` a new `row` object to break the memo. In every real caller
 * this happens for free: `rows` starts empty while `useTable`'s fetch is
 * in flight and is replaced with fresh row objects once it resolves,
 * well after `#filter-item-name` has mounted. A story with `rows` fixed
 * from the first render has no such second pass, so this story fakes
 * that arrival — remove it and the icon silently never appears.
 *
 * The fake arrival can't be a single fixed-delay `setTimeout`, or even a
 * single retry gated on `#filter-item-name` existing: confirmed
 * empirically (repeated fresh reloads of this same story, no code
 * changed) that even a `row`-identity-breaking re-render issued right
 * after that DOM node appears sometimes still reads `hasFilterMenu()` as
 * `false` — apparently Radix `Presence`'s own mount scheduling for a
 * `forceMount`ed node isn't a single settle point under dev/StrictMode's
 * double-render, so one retry can still lose the race. Real pages don't
 * hit this because they re-render `TableCell` many times over for
 * unrelated reasons (sorting, pagination, further data arriving) long
 * after mount, any one of which eventually lands after things settle.
 * This story fakes that same "eventually" by keeping to hand `TableCell`
 * a new `row` identity every animation frame until the icon itself
 * exists, rather than gambling everything on one retry. */
export const InlineCellFilter: Story = {
  render: () => {
    const [rows, setRows] = useState(tableStoryRows);
    useEffect(() => {
      let cancelled = false;
      let attempts = 0;
      const maxAttempts = 40;
      const tick = () => {
        if (cancelled) return;
        if (document.querySelector('.inline-filter')) return;
        if (attempts >= maxAttempts) return;
        attempts += 1;
        setRows(tableStoryRows.map((row) => ({ ...row })));
        timer = setTimeout(tick, 100);
      };
      let timer = setTimeout(tick, 100);
      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }, []);
    return (
      <div id="kt_content_container">
        <Table
          {...tableStoryBaseProps}
          rows={rows}
          columns={tableStoryColumns.map((column) =>
            column.id === 'name'
              ? { ...column, filter: 'name', inlineFilter: (row) => row.name }
              : column,
          )}
          filters={tableStoryFilters}
          filtersStorage={[]}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The delayed row-refresh above races this play function, so wait for
    // the icon to exist before hovering — `.inline-filter` is a real
    // `<button>` (TableBody.tsx's `InlineFilterButton`), always present
    // once `hasFilter` resolves true; hovering only toggles its CSS
    // visibility, which getByRole/querySelector don't need to see it.
    await waitFor(
      () =>
        expect(canvasElement.querySelector('.inline-filter')).not.toBeNull(),
      { timeout: 5000 },
    );
    await userEvent.hover(canvas.getByText('production-cluster'));
  },
};
