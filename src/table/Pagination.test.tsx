import { describe, expect, test } from 'vitest';

import { buildPaginationItems, PaginationItem } from './Pagination';

// Compact view that's easier to assert against. Skips the navigation
// items (first/prev/next/last) — they're tested separately. Pages are
// represented as `1` / `(2)` (active) / `…` (ellipsis).
const summarize = (items: PaginationItem[]) =>
  items
    .filter((i) => i.type === 'page' || i.type === 'ellipsis')
    .map((i) =>
      i.type === 'ellipsis' ? '…' : i.isActive ? `(${i.value})` : `${i.value}`,
    )
    .join(' ');

describe('buildPaginationItems', () => {
  test('emits every page when the window fits the total range', () => {
    expect(
      summarize(buildPaginationItems({ currentPage: 1, totalPages: 5 })),
    ).toBe('(1) 2 3 4 5');
  });

  test('emits ellipses on both sides for a long range', () => {
    expect(
      summarize(buildPaginationItems({ currentPage: 10, totalPages: 20 })),
    ).toBe('1 … 9 (10) 11 … 20');
  });

  // The sibling window is fixed-size (2*siblingPagesRange + 1 pages) and
  // SHIFTS toward the boundary when currentPage is near it — it does not
  // shrink. That mirrors ultimate-pagination's behavior and keeps the
  // total visible-page count stable across navigation.
  test('shifts the sibling window toward the start when currentPage is near it', () => {
    expect(
      summarize(buildPaginationItems({ currentPage: 2, totalPages: 20 })),
    ).toBe('1 (2) 3 4 5 … 20');
  });

  test('shifts the sibling window toward the end when currentPage is near it', () => {
    expect(
      summarize(buildPaginationItems({ currentPage: 19, totalPages: 20 })),
    ).toBe('1 … 16 17 18 (19) 20');
  });

  test('collapses a single-page gap into the page itself instead of an ellipsis', () => {
    // Gap between boundary 1 and sibling window 3-5 is just page 2 — show
    // it as a page, not "...". (Upstream behavior: a 1-page ellipsis costs
    // an extra click without saving any space.)
    expect(
      summarize(buildPaginationItems({ currentPage: 4, totalPages: 7 })),
    ).toBe('1 2 3 (4) 5 6 7');
  });

  test('honors boundaryPagesRange=0 and siblingPagesRange=2 (the >1000-result branch in TablePagination)', () => {
    expect(
      summarize(
        buildPaginationItems({
          currentPage: 50,
          totalPages: 100,
          boundaryPagesRange: 0,
          siblingPagesRange: 2,
        }),
      ),
    ).toBe('… 48 49 (50) 51 52 …');
  });

  test('renders a single-page list as just that page', () => {
    expect(
      summarize(buildPaginationItems({ currentPage: 1, totalPages: 1 })),
    ).toBe('(1)');
  });

  test('marks first/prev disabled on currentPage=1', () => {
    const items = buildPaginationItems({ currentPage: 1, totalPages: 5 });
    const first = items.find((i) => i.type === 'first')!;
    const prev = items.find((i) => i.type === 'prev')!;
    expect(first.type === 'first' && first.isActive).toBe(true);
    expect(prev.type === 'prev' && prev.isActive).toBe(true);
  });

  test('marks next/last disabled on currentPage=totalPages', () => {
    const items = buildPaginationItems({ currentPage: 5, totalPages: 5 });
    const next = items.find((i) => i.type === 'next')!;
    const last = items.find((i) => i.type === 'last')!;
    expect(next.type === 'next' && next.isActive).toBe(true);
    expect(last.type === 'last' && last.isActive).toBe(true);
  });

  test('omits first/last when hideFirstAndLastPageLinks is true (TablePagination default)', () => {
    const items = buildPaginationItems({
      currentPage: 2,
      totalPages: 5,
      hideFirstAndLastPageLinks: true,
    });
    expect(items.some((i) => i.type === 'first')).toBe(false);
    expect(items.some((i) => i.type === 'last')).toBe(false);
  });

  test('omits prev/next when hidePreviousAndNextPageLinks is true (TablePagination default)', () => {
    const items = buildPaginationItems({
      currentPage: 2,
      totalPages: 5,
      hidePreviousAndNextPageLinks: true,
    });
    expect(items.some((i) => i.type === 'prev')).toBe(false);
    expect(items.some((i) => i.type === 'next')).toBe(false);
  });

  test('drops ellipsis markers when hideEllipsis is true', () => {
    const items = buildPaginationItems({
      currentPage: 10,
      totalPages: 20,
      hideEllipsis: true,
    });
    expect(items.some((i) => i.type === 'ellipsis')).toBe(false);
    // Pages 1, 9, 10, 11, 20 still appear.
    expect(
      summarize(items)
        .split(' ')
        .filter((s) => s !== '…')
        .join(' '),
    ).toBe('1 9 (10) 11 20');
  });
});
