import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n/translate';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { ExportData } from '@/table/exporters/types';
import { Column } from '@/table/types';

/** Stable identity for pin state. Optional-columns tables always set `id`;
 * plain tables fall back to the render index, which TableHeader and TableBody
 * share because both iterate the same visibleColumns array. */
export const getColumnPinKey = (column: Column, index: number): string =>
  column.id ?? 'column-' + index;

/** Walks header cells in DOM order and derives the sticky insets of each
 * pinned column. Each pinned cell gets BOTH a `left` (sum of the widths of
 * pinned cells before it) and a `right` (sum of the widths of pinned cells
 * after it, plus `endBase` — the width of the right-pinned actions column).
 * With both insets set, a sticky cell clamps to the left edge when scrolled
 * past, clamps to the right edge while its natural position is off-screen,
 * and sits naturally in between — so a pinned column is always visible. */
export const computePinnedOffsets = (
  cells: Array<{ key: string; width: number }>,
  pinnedKeys: string[],
  endBase = 0,
): Record<string, { left: number; right: number }> => {
  const pinnedCells = cells.filter((cell) => pinnedKeys.includes(cell.key));
  const totalWidth = pinnedCells.reduce((sum, cell) => sum + cell.width, 0);
  const offsets: Record<string, { left: number; right: number }> = {};
  let acc = 0;
  pinnedCells.forEach((cell) => {
    offsets[cell.key] = {
      left: acc,
      right: endBase + (totalWidth - acc - cell.width),
    };
    acc += cell.width;
  });
  return offsets;
};

/** Derives which pinned cells are currently stuck to an edge of the scrollport
 * and therefore cast a floating shadow: the deepest cell stuck at the left
 * edge shadows its right side ('end'), the first cell stuck at the right edge
 * shadows its left side ('start') — marking the boundaries where unpinned
 * content slides under the floating group. `x` is the cell's natural offset
 * within the table. */
export const computePinnedShadows = (
  cells: Array<{
    key: string;
    x: number;
    width: number;
    left: number;
    right: number;
  }>,
  scrollLeft: number,
  viewportWidth: number,
): Record<string, 'start' | 'end'> => {
  const TOLERANCE = 2;
  let lastLeftStuck: string | null = null;
  let firstRightStuck: string | null = null;
  cells.forEach((cell) => {
    if (cell.x < scrollLeft + cell.left - TOLERANCE) {
      lastLeftStuck = cell.key;
    }
    if (
      !firstRightStuck &&
      cell.x + cell.width > scrollLeft + viewportWidth - cell.right + TOLERANCE
    ) {
      firstRightStuck = cell.key;
    }
  });
  const shadows: Record<string, 'start' | 'end'> = {};
  if (lastLeftStuck) {
    shadows[lastLeftStuck] = 'end';
  }
  if (firstRightStuck && !(firstRightStuck in shadows)) {
    shadows[firstRightStuck] = 'start';
  }
  return shadows;
};

export const getId = (row, index) => {
  if (row.uuid) {
    return row.uuid;
  } else if (row.pk) {
    return row.pk;
  }
  return index;
};

export const formatLongText = (value) =>
  value && value.length > 100 ? (
    <Tip label={value} id="longText">
      <span className="ellipsis d-inline-block" style={{ width: 150 }}>
        {value}
      </span>
    </Tip>
  ) : (
    value
  );

export const transformRows = (rows: any[]) => {
  const entities: object = {};
  const order: any[] = [];
  rows.forEach((row, index) => {
    entities[getId(row, index)] = row;
    order.push(getId(row, index));
  });
  return { entities, order };
};

export const renderFieldOrDash = (field) => (field ? field : DASH_ESCAPE_CODE);

export function getNoResultMessage({ query, verboseName, customEmpty = null }) {
  const context = {
    verboseName: String(verboseName || translate('Items')).toLowerCase(),
    query: query,
  };
  if (query) {
    return translate(
      'Your search "{query}" did not match any {verboseName}.',
      context,
    );
  } else {
    return customEmpty || translate('There are no {verboseName} yet.', context);
  }
}

export function getNoResultTitle({ verboseName, hasFilter = false }) {
  const context = {
    verboseName: String(verboseName || translate('Items')).toLowerCase(),
  };
  if (hasFilter) {
    return translate(
      'No {verboseName} found matching current filters',
      context,
    );
  }
  return translate('No {verboseName} found', context);
}

export const getSavedFiltersKey = (table, formId) =>
  `waldur/table/filters/${table}/${formId}`;

export const getSimpleExportData = <T = any,>(
  columns: Column<T>[],
  rows: T[],
): ExportData => {
  const fields = columns
    .filter((column) => column.export !== false)
    .map((column) => column.exportTitle || (column.title as string));
  const data = (rows || []).map((row) =>
    columns
      .filter((column) => column.export !== false)
      .map((column) => {
        if (typeof column.export === 'function') {
          return (column.export as any)(row);
        } else if (typeof column.export === 'string') {
          return row[column.export];
        } else if (column.export === true || column.export === undefined) {
          return (
            (column.id && row[column.id]) ||
            (column.orderField && row[column.orderField])
          );
        }
        return '';
      }),
  );
  return { fields, data } as ExportData;
};
