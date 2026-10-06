import { useMemo } from 'react';
import { translate } from 'waldur-i18n-runtime';

import { cn } from '../../cn';

import { buildPaginationItems } from './buildPaginationItems';

/**
 * Shared by the page numbers, the ellipsis and the prev/next buttons. Sizes
 * are pixels, not rem: the app's root font size is 13px (12px on mobile),
 * a micro-app's is the browser's 16px, and the pager should look the same
 * in both. `bg-[transparent]` rather than `bg-transparent`, which collides
 * with Bootstrap's `!important` utility of the same name.
 */
export const PAGINATION_ITEM_CLASSNAME =
  'inline-flex items-center justify-center rounded-[8px] bg-[transparent] text-[14px] font-medium transition-[color,background-color] duration-200';

const PAGE_CLASSNAME = cn(
  PAGINATION_ITEM_CLASSNAME,
  'h-[40px] min-w-[40px] px-[8px] text-[var(--pagination-text)]',
  'hover:bg-[var(--pagination-hover-bg)] hover:text-[var(--pagination-text-current)]',
  'focus-visible:bg-[var(--pagination-hover-bg)]',
  'aria-[current=page]:bg-[var(--pagination-hover-bg)] aria-[current=page]:text-[var(--pagination-text-current)]',
);

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** Pages always shown at the very start and very end (default 1). */
  boundaryPagesRange?: number;
  /** Pages shown on each side of currentPage (default 1). */
  siblingPagesRange?: number;
  onChange: (page: number) => void;
  className?: string;
}

/**
 * The numbered page list: `1 … 9 [10] 11 … 20`. Prev/next live in
 * TablePagination, next to the item count, so this renders pages and
 * ellipses only. The current page keeps its button (so focus does not jump
 * when it is clicked) and is marked with `aria-current="page"`.
 */
export const Pagination = ({
  currentPage,
  totalPages,
  boundaryPagesRange,
  siblingPagesRange,
  onChange,
  className,
}: PaginationProps) => {
  const items = useMemo(
    () =>
      buildPaginationItems({
        currentPage,
        totalPages,
        boundaryPagesRange,
        siblingPagesRange,
        hideFirstAndLastPageLinks: true,
        hidePreviousAndNextPageLinks: true,
      }),
    [currentPage, totalPages, boundaryPagesRange, siblingPagesRange],
  );
  return (
    <nav aria-label={translate('Pagination')} className={className}>
      <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-[2px] p-0">
        {items.map((item) => {
          if (item.type === 'ellipsis') {
            return (
              <li key={`ellipsis${item.key}`}>
                <span
                  aria-hidden="true"
                  className={cn(
                    PAGINATION_ITEM_CLASSNAME,
                    'h-[40px] min-w-[40px] text-[var(--pagination-text-disabled)]',
                  )}
                >
                  …
                </span>
              </li>
            );
          }
          if (item.type !== 'page') {
            return null;
          }
          return (
            <li key={item.value}>
              <button
                type="button"
                aria-current={item.isActive ? 'page' : undefined}
                className={PAGE_CLASSNAME}
                onClick={() => {
                  if (!item.isActive) onChange(item.value);
                }}
              >
                {item.value}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
