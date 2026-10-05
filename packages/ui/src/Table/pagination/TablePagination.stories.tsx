import type { Meta, StoryObj } from '@storybook/react-vite';

import { TablePagination } from './TablePagination';

/**
 * A table's footer: "Rows per page", the numbered pages, the item range and
 * prev/next — and, below the md breakpoint, a separate "‹ Page X of Y ›"
 * layout. Which layout shows is a real media query against the canvas
 * width, so the stories below pin `globals.viewport`.
 *
 * Colours come from the `--pagination-*` tokens in
 * waldur-design-tokens/surfaceColors.css, so the pager looks the same
 * standalone, in a homeport table card or in a micro-app.
 */
const meta: Meta<typeof TablePagination> = {
  title: 'Data Display/Table/TablePagination',
  component: TablePagination,
  decorators: [
    (Story) => (
      <div className="bg-[var(--surface-card-bg)]">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof TablePagination>;

const noop = () => undefined;

/** The desktop layout: "Rows per page", numbered pages, the item range and
 * prev/next — forced via `globals.viewport` since the default Storybook
 * canvas is narrower than the 768px breakpoint. */
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

/** The mobile layout: "Page X of Y" between two icon buttons, no page
 * numbers. */
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

/** Over a thousand results the first/last page links give way to a wider
 * window around the current page: "… 498 499 [500] 501 502 …". */
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

/** At or below `PAGE_SIZE_COMPACT` (5) results the pager renders nothing. */
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

/** Without the top border, for a pager under something that is not a
 * table (a list of form fields). */
export const Borderless: Story = {
  globals: { viewport: 'desktop' },
  render: () => (
    <TablePagination
      currentPage={2}
      pageSize={5}
      resultCount={12}
      gotoPage={noop}
      updatePageSize={noop}
      showPageSizeSelector
      hasRows
      bordered={false}
    />
  ),
};
