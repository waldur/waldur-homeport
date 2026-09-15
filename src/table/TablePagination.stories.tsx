import type { Meta, StoryObj } from '@storybook/react-vite';

import { withCardTable } from './storyProviders';
import { TablePagination } from './TablePagination';

/**
 * `TablePagination.tsx` — not the lower-level `Pagination.tsx` it wraps —
 * is what a real table actually shows. It adds an item-count string and
 * `TablePageSize`, and *replaces* `Pagination`'s own First/Prev/Next/Last
 * (always hidden — `TablePagination` passes `hideFirstAndLastPageLinks`/
 * `hidePreviousAndNextPageLinks` unconditionally) with its own hand-rolled
 * chevron buttons. It also has an entirely separate mobile rendering
 * ("Page X of Y" + chevrons only, no page-number list at all) that doesn't
 * go through `buildPaginationItems`/`Pagination` in any way.
 *
 * Both blocks are Bootstrap `d-none d-md-block` / `d-flex d-md-none` — a
 * real CSS media query against the actual iframe width, not a React prop —
 * so which one renders depends on the *live* Storybook viewport, not a
 * container decorator. `Table.stories.tsx`'s own `Populated` story
 * demonstrates this by accident: at the default (sub-768px) canvas width,
 * it shows "‹ Page 1 of 3 ›", not a numbered page list. Use
 * `globals.viewport` below to force each variant explicitly.
 *
 * The active page's color depends on an ancestor class it's easy to drop by
 * accident: `custom/_table.scss` recolors `.card.card-table .table-
 * pagination .page-item.active .page-link` to the same neutral gray the
 * rest of the table chrome uses (`$bg-primary_hover`/`$text-secondary`,
 * both `$gray-*` tokens) — but that selector needs a `.card.card-table`
 * ancestor, which `Table.tsx` always provides (its outer `<Card
 * className="card-table">`) and a standalone `<TablePagination>` does not.
 * Without it, only Bootstrap's own unscoped `.page-item.active .page-link`
 * rule matches, which falls through to plain `$primary` (a hardcoded
 * green, unrelated to the tenant's brand color). Confirmed empirically:
 * `getComputedStyle` on the active page read `rgb(48, 115, 0)` ($primary)
 * without the wrapper, and the app's actual gray with it. `meta`'s
 * `withCardTable` decorator (storyProviders.tsx) wraps every story below in
 * that same `<Card>` for this reason — dropping it silently reverts to the
 * wrong (if real-looking) green.
 *
 * Otherwise self-contained like `Pagination.tsx` — no Redux/router.
 */
const meta: Meta<typeof TablePagination> = {
  title: 'Data Display/Table/TablePagination',
  component: TablePagination,
  decorators: [withCardTable],
};
export default meta;

type Story = StoryObj<typeof TablePagination>;

const noop = () => undefined;

/** The desktop composition: item count, "Rows per page" selector, numbered
 * pagination (nav links hidden — see this file's own comment), and this
 * component's own chevrons — forced via `globals.viewport` since the
 * default Storybook canvas is narrower than the 768px breakpoint this
 * depends on. */
export const Desktop: Story = {
  globals: { viewport: 'desktop' },
  render: () => (
    <TablePagination
      currentPage={1}
      pageSize={10}
      resultCount={42}
      gotoPage={noop}
      updatePageSize={noop}
      showPageSizeSelector
      hasRows
    />
  ),
};

/** The mobile composition — a completely different, simpler UI ("Page X of
 * Y" + two icon buttons) that doesn't call `buildPaginationItems` at all.
 * This is what most `Table.stories.tsx` stories actually show by default,
 * and what phone-width real usage always shows. */
export const Mobile: Story = {
  globals: { viewport: 'mobile' },
  render: () => (
    <TablePagination
      currentPage={1}
      pageSize={10}
      resultCount={42}
      gotoPage={noop}
      updatePageSize={noop}
      showPageSizeSelector
      hasRows
    />
  ),
};

/** A result set over 1000 — `TablePagination.tsx`'s own config for that
 * case (`boundaryPagesRange={0} siblingPagesRange={2}`, no first/last
 * boundary page, a wider neighborhood around the current page instead), so
 * the item-count text ("4991-5000 of 15000 items") and the no-boundary-
 * pages pagination read together the way they actually do in the app. */
export const LargeResultSet: Story = {
  globals: { viewport: 'desktop' },
  render: () => (
    <TablePagination
      currentPage={500}
      pageSize={10}
      resultCount={15000}
      gotoPage={noop}
      updatePageSize={noop}
      showPageSizeSelector
      hasRows
    />
  ),
};

/** `resultCount` at (or below) `PAGE_SIZE_COMPACT` (5) — `TablePagination`
 * renders `null` outright, not just a hidden/collapsed control. */
export const HiddenBelowCompactThreshold: Story = {
  render: () => (
    <TablePagination
      currentPage={1}
      pageSize={10}
      resultCount={5}
      gotoPage={noop}
      updatePageSize={noop}
      showPageSizeSelector
      hasRows
    />
  ),
};
