import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { translate } from 'waldur-i18n-runtime';

import { BaseButton } from '../../BaseButton';
import { cn } from '../../cn';

import { PAGE_SIZE_COMPACT } from './constants';
import { PageSizeSelect } from './PageSizeSelect';
import { Pagination, PAGINATION_ITEM_CLASSNAME } from './Pagination';
import { PaginationState } from './types';

const NAV_BUTTON_CLASSNAME = cn(
  PAGINATION_ITEM_CLASSNAME,
  'size-[28px] p-0 text-[var(--pagination-icon)]',
  'hover:bg-[var(--pagination-hover-bg)] hover:text-[var(--pagination-icon-hover)]',
  'focus-visible:bg-[var(--pagination-hover-bg)]',
  'disabled:pointer-events-none disabled:text-[var(--pagination-text-disabled)]',
);

export interface TablePaginationProps extends PaginationState {
  gotoPage: (page: number) => void;
  updatePageSize: (pageSize: number) => void;
  showPageSizeSelector?: boolean;
  /** False while the current page is empty (loading or no results). */
  hasRows: boolean;
  /**
   * The top border and spacing that separate the bar from the rows above
   * it (default true). Turn off where the pager follows something that is
   * not a table, such as a list of form fields.
   */
  bordered?: boolean;
  className?: string;
}

/**
 * A table's footer: "Rows per page", the page numbers, "11-20 of 42 items"
 * and prev/next. Below the md breakpoint it collapses to
 * "‹ Page 2 of 5 ›". Renders nothing when every result fits on one compact
 * page.
 *
 * The root keeps the `table-pagination` class as a hook for page layouts
 * that adjust its padding (homeport's full-width and nested tables). The
 * two layouts carry `data-pagination-layout="desktop|mobile"` so a layout
 * can switch between them on its own width, as the helpdesk list does with
 * a container query.
 */
export const TablePagination = ({
  currentPage,
  pageSize,
  resultCount,
  gotoPage,
  updatePageSize,
  showPageSizeSelector,
  hasRows,
  bordered = true,
  className,
}: TablePaginationProps) => {
  if (resultCount <= PAGE_SIZE_COMPACT) {
    return null;
  }

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, resultCount);
  const totalPages = Math.ceil(resultCount / pageSize);
  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;
  // Past a thousand results the first/last page links give way to a wider
  // window around the current page.
  const isLarge = resultCount > 1000;

  return (
    <div
      className={cn(
        'table-pagination md:px-[16.25px]',
        bordered &&
          'border-t-[1px] border-solid border-[var(--pagination-border)] pt-[12px]',
        className,
      )}
    >
      <div
        data-pagination-layout="desktop"
        className="hidden items-center gap-[19.5px] md:flex"
      >
        <div className="shrink-0">
          {showPageSizeSelector && (
            <PageSizeSelect pageSize={pageSize} onChange={updatePageSize} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          {hasRows && resultCount > pageSize && (
            <Pagination
              currentPage={Math.min(currentPage, totalPages)}
              totalPages={totalPages}
              boundaryPagesRange={isLarge ? 0 : undefined}
              siblingPagesRange={isLarge ? 2 : undefined}
              onChange={gotoPage}
            />
          )}
        </div>
        <div className="flex shrink-0 items-center gap-[2px]">
          {hasRows && (
            <div className="mr-[22px] whitespace-nowrap text-[12px] text-[var(--pagination-text)]">
              {translate('{from}-{to} of {all} items', {
                from,
                to,
                all: resultCount,
              })}
            </div>
          )}
          <button
            type="button"
            aria-label={translate('Previous page')}
            className={NAV_BUTTON_CLASSNAME}
            disabled={prevDisabled}
            onClick={() => gotoPage(currentPage - 1)}
          >
            <CaretLeftIcon size={20} weight="bold" />
          </button>
          <button
            type="button"
            aria-label={translate('Next page')}
            className={NAV_BUTTON_CLASSNAME}
            disabled={nextDisabled}
            onClick={() => gotoPage(currentPage + 1)}
          >
            <CaretRightIcon size={20} weight="bold" />
          </button>
        </div>
      </div>

      <div
        data-pagination-layout="mobile"
        className="flex items-center justify-between md:hidden"
      >
        <BaseButton
          iconNode={<CaretLeftIcon weight="bold" />}
          tooltip={translate('Previous page')}
          onClick={() => gotoPage(currentPage - 1)}
          disabled={prevDisabled}
          size="lg"
          variant="tertiary"
        />
        {hasRows && (
          <div className="mx-[6px] whitespace-nowrap text-[14px] font-medium text-[var(--pagination-text-current)]">
            {translate('Page {page} of {total}', {
              page: currentPage,
              total: totalPages,
            })}
          </div>
        )}
        <BaseButton
          iconNode={<CaretRightIcon weight="bold" />}
          tooltip={translate('Next page')}
          onClick={() => gotoPage(currentPage + 1)}
          disabled={nextDisabled}
          size="lg"
          variant="tertiary"
        />
      </div>
    </div>
  );
};
