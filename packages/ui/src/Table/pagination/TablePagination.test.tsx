import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TablePagination, TablePaginationProps } from './TablePagination';

const renderPagination = (props: Partial<TablePaginationProps> = {}) => {
  const gotoPage = vi.fn();
  const updatePageSize = vi.fn();
  const utils = render(
    <TablePagination
      currentPage={2}
      pageSize={10}
      resultCount={42}
      hasRows
      showPageSizeSelector
      gotoPage={gotoPage}
      updatePageSize={updatePageSize}
      {...props}
    />,
  );
  return { gotoPage, updatePageSize, ...utils };
};

// jsdom applies no media queries, so both layouts are in the DOM: the
// desktop one first, then the mobile one.
const desktopButton = (name: string) =>
  screen.getAllByRole('button', { name })[0];
const mobileButton = (name: string) =>
  screen.getAllByRole('button', { name })[1];

describe('TablePagination', () => {
  it('renders nothing when every result fits on one compact page', () => {
    const { container } = renderPagination({ resultCount: 5 });
    expect(container).toBeEmptyDOMElement();
  });

  it('marks the current page and moves to another', async () => {
    const { gotoPage } = renderPagination();
    const nav = screen.getByRole('navigation', { name: 'Pagination' });

    expect(within(nav).getByRole('button', { name: '2' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(nav).getByRole('button', { name: '3' })).not.toHaveAttribute(
      'aria-current',
    );

    await userEvent.click(within(nav).getByRole('button', { name: '3' }));
    expect(gotoPage).toHaveBeenCalledWith(3);
  });

  it('does not navigate when the current page is clicked', async () => {
    const { gotoPage } = renderPagination();
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    expect(gotoPage).not.toHaveBeenCalled();
  });

  it('shows the item range and steps with prev/next', async () => {
    const { gotoPage } = renderPagination();
    expect(screen.getByText('11-20 of 42 items')).toBeInTheDocument();

    await userEvent.click(desktopButton('Previous page'));
    await userEvent.click(desktopButton('Next page'));
    expect(gotoPage.mock.calls).toEqual([[1], [3]]);
  });

  it('disables prev on the first page and next on the last', () => {
    const first = renderPagination({ currentPage: 1 });
    expect(desktopButton('Previous page')).toBeDisabled();
    expect(desktopButton('Next page')).toBeEnabled();
    first.unmount();

    renderPagination({ currentPage: 5 });
    expect(desktopButton('Next page')).toBeDisabled();
  });

  it('elides pages past a thousand results', () => {
    renderPagination({ currentPage: 500, resultCount: 15000 });
    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    const pages = within(nav)
      .getAllByRole('button')
      .map((button) => button.textContent);
    // No first/last boundary pages; two siblings on each side instead.
    expect(pages).toEqual(['498', '499', '500', '501', '502']);
    expect(screen.getByText('4991-5000 of 15000 items')).toBeInTheDocument();
  });

  it('changes the page size', async () => {
    const { updatePageSize } = renderPagination();
    await userEvent.selectOptions(
      screen.getByLabelText('Rows per page:'),
      '25',
    );
    expect(updatePageSize).toHaveBeenCalledWith(25);
  });

  it('hides the page size selector unless asked for', () => {
    renderPagination({ showPageSizeSelector: false });
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('collapses to "Page X of Y" in the mobile layout', async () => {
    const { gotoPage } = renderPagination();
    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
    await userEvent.click(mobileButton('Next page'));
    expect(gotoPage).toHaveBeenCalledWith(3);
  });

  it('can drop the top border', () => {
    const { container } = renderPagination({ bordered: false });
    // eslint-disable-next-line testing-library/no-node-access
    expect(container.firstElementChild).not.toHaveClass('border-t-[1px]');
  });
});
