import { FunctionComponent, useMemo } from 'react';
import { Pagination } from 'react-bootstrap';

// Pure port of ultimate-pagination's getPaginationModel — see
// node_modules/ultimate-pagination/lib/ultimate-pagination.js (3-year-stale,
// CJS-only, the reason for the port). Same name and same `isActive`
// semantics (the upstream uses `isActive` to mean "disabled" on nav links;
// we preserve the name to keep the shape testable against the old behavior).
export type PaginationItem =
  | { type: 'page'; value: number; isActive: boolean }
  | { type: 'ellipsis'; key: number }
  | { type: 'first' | 'prev' | 'next' | 'last'; isActive: boolean };

export interface PaginationOptions {
  currentPage: number;
  totalPages: number;
  /** Pages always shown at the very start and very end (default 1). */
  boundaryPagesRange?: number;
  /** Pages shown on each side of currentPage (default 1). */
  siblingPagesRange?: number;
  hideEllipsis?: boolean;
  hideFirstAndLastPageLinks?: boolean;
  hidePreviousAndNextPageLinks?: boolean;
}

const range = (start: number, end: number): number[] => {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
};

export const buildPaginationItems = ({
  currentPage,
  totalPages,
  boundaryPagesRange = 1,
  siblingPagesRange = 1,
  hideEllipsis = false,
  hideFirstAndLastPageLinks = false,
  hidePreviousAndNextPageLinks = false,
}: PaginationOptions): PaginationItem[] => {
  const items: PaginationItem[] = [];
  const ellipsisSize = hideEllipsis ? 0 : 1;
  const pageItem = (value: number): PaginationItem => ({
    type: 'page',
    value,
    isActive: currentPage === value,
  });

  if (!hideFirstAndLastPageLinks) {
    items.push({ type: 'first', isActive: currentPage === 1 });
  }
  if (!hidePreviousAndNextPageLinks) {
    items.push({ type: 'prev', isActive: currentPage === 1 });
  }

  // If the layout would touch every page anyway, just emit all of them.
  // Mirrors upstream's "simplify generation" branch.
  if (
    1 + 2 * ellipsisSize + 2 * siblingPagesRange + 2 * boundaryPagesRange >=
    totalPages
  ) {
    range(1, totalPages).forEach((v) => items.push(pageItem(v)));
  } else {
    // First / last boundary slabs (empty when boundaryPagesRange === 0).
    const firstPagesEnd = boundaryPagesRange;
    const lastPagesStart = totalPages + 1 - boundaryPagesRange;
    const firstPages = range(1, firstPagesEnd);
    const lastPages = range(lastPagesStart, totalPages);

    // Center the sibling window around currentPage, clamped so it never
    // overlaps the boundary slabs (or the ellipsis slot next to them).
    const mainPagesStart = Math.min(
      Math.max(
        currentPage - siblingPagesRange,
        firstPagesEnd + ellipsisSize + 1,
      ),
      lastPagesStart - ellipsisSize - 2 * siblingPagesRange - 1,
    );
    const mainPagesEnd = mainPagesStart + 2 * siblingPagesRange;

    firstPages.forEach((v) => items.push(pageItem(v)));

    if (!hideEllipsis) {
      // A 1-page gap between the first boundary slab and the sibling
      // window collapses into that single page (no point eliding it).
      const firstEllipsisValue = mainPagesStart - 1;
      if (firstEllipsisValue === firstPagesEnd + 1) {
        items.push(pageItem(firstEllipsisValue));
      } else {
        items.push({ type: 'ellipsis', key: -1 });
      }
    }

    range(mainPagesStart, mainPagesEnd).forEach((v) => items.push(pageItem(v)));

    if (!hideEllipsis) {
      const secondEllipsisValue = mainPagesEnd + 1;
      if (secondEllipsisValue === lastPagesStart - 1) {
        items.push(pageItem(secondEllipsisValue));
      } else {
        items.push({ type: 'ellipsis', key: -2 });
      }
    }

    lastPages.forEach((v) => items.push(pageItem(v)));
  }

  if (!hidePreviousAndNextPageLinks) {
    items.push({ type: 'next', isActive: currentPage === totalPages });
  }
  if (!hideFirstAndLastPageLinks) {
    items.push({ type: 'last', isActive: currentPage === totalPages });
  }

  return items;
};

interface PaginationProps extends PaginationOptions {
  onChange?: (page: number) => void;
  disabled?: boolean;
}

const PaginationComponent: FunctionComponent<PaginationProps> = (props) => {
  const { currentPage, totalPages, onChange, disabled } = props;
  const items = useMemo(() => buildPaginationItems(props), [props]);
  const go = (page: number) => {
    if (disabled || page === currentPage) return;
    onChange?.(page);
  };
  return (
    <Pagination>
      {items.map((item, idx) => {
        switch (item.type) {
          case 'first':
            return (
              <Pagination.First
                key={`first-${idx}`}
                disabled={disabled || item.isActive}
                onClick={() => go(1)}
              />
            );
          case 'prev':
            return (
              <Pagination.Prev
                key={`prev-${idx}`}
                disabled={disabled || item.isActive}
                onClick={() => go(Math.max(currentPage - 1, 1))}
              />
            );
          case 'next':
            return (
              <Pagination.Next
                key={`next-${idx}`}
                disabled={disabled || item.isActive}
                onClick={() => go(Math.min(currentPage + 1, totalPages))}
              />
            );
          case 'last':
            return (
              <Pagination.Last
                key={`last-${idx}`}
                disabled={disabled || item.isActive}
                onClick={() => go(totalPages)}
              />
            );
          case 'ellipsis':
            return (
              <Pagination.Ellipsis key={`ellipsis-${item.key}`} disabled />
            );
          case 'page':
            return (
              <Pagination.Item
                key={`page-${item.value}`}
                active={item.isActive}
                onClick={() => go(item.value)}
              >
                {item.value}
              </Pagination.Item>
            );
        }
      })}
    </Pagination>
  );
};

export default PaginationComponent;
