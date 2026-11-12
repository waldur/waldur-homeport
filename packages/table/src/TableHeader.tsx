import { FC, useCallback, useMemo } from 'react';

import { TableActionsHead } from './TableActionsColumn';
import { TableControlHead } from './TableControlColumn';
import { TableHeaderCell } from './TableHeaderCell';
import {
  TableProps,
  Column,
  Sorting,
  PinnedColumns,
  PinnedOffsets,
} from './types';
import { getColumnPinKey, getId, resolveVisibleColumns } from './utils';

interface TableHeaderProps {
  columns: Column[];
  onSortClick?(sorting: Sorting): void;
  currentSorting?: Sorting;
  expandableRow?: boolean;
  hideExpandToggle?: boolean;
  showActions?: boolean;
  rows: any[];
  rowKey?: string;
  enableMultiSelect?: boolean;
  onSelectAllRows?(rows: any[]): void;
  selectedRows?: any[];
  toggled?: TableProps['toggled'];
  toggleRow?: TableProps['toggleRow'];
  fieldType?: TableProps['fieldType'];
  activeColumns?: Record<string, boolean>;
  filters?: TableProps['filters'];
  filtersStorage?: TableProps['filtersStorage'];
  setFilter?: TableProps['setFilter'];
  applyFiltersFn?: TableProps['applyFiltersFn'];
  columnPositions: string[];
  hasOptionalColumns?: boolean;
  equalColWidth?: boolean;
  toggleFilterMenu(show?): void;
  pinnedColumns?: PinnedColumns;
  pinnedOffsets?: PinnedOffsets;
  toggleColumnPin?(id: string): void;
}

export const TableHeader: FC<TableHeaderProps> = ({
  columns,
  columnPositions,
  onSortClick,
  currentSorting,
  expandableRow = false,
  hideExpandToggle = false,
  showActions,
  rows,
  rowKey,
  enableMultiSelect,
  onSelectAllRows,
  selectedRows,
  toggled,
  toggleRow,
  fieldType,
  filters,
  filtersStorage,
  setFilter,
  applyFiltersFn,
  hasOptionalColumns,
  equalColWidth,
  toggleFilterMenu,
  pinnedColumns = {},
  pinnedOffsets = {},
  toggleColumnPin,
}) => {
  const columnMap = useMemo(
    () =>
      columns.reduce<Record<string, Column>>(
        (result, column) => ({ ...result, [column.id]: column }),
        {},
      ),
    [columns],
  );

  const toggledAll = useMemo(() => {
    if (!expandableRow || rows.length === 0) return false;
    return rows.every((row, i) => toggled[getId(row, i, rowKey)]);
  }, [toggled, rows, rowKey, expandableRow]);

  const toggleAll = useCallback(() => {
    if (toggledAll) {
      rows.forEach((row, i) => {
        toggleRow(getId(row, i, rowKey));
      });
    } else {
      rows.forEach((row, i) => {
        const rowId = getId(row, i, rowKey);
        if (!toggled[rowId]) toggleRow(rowId);
      });
    }
  }, [rows, rowKey, toggledAll, toggled, toggleRow]);

  const visibleCols = useMemo<Column[]>(
    () => resolveVisibleColumns(columns, columnPositions, hasOptionalColumns),
    [hasOptionalColumns, columnPositions, columns],
  );

  const colWidths = useMemo(() => {
    if (visibleCols.length <= 1) return { first: 100, other: 0 };
    const firstColMul = equalColWidth ? 1 : 2;
    const colsWithoutCustomWidth = visibleCols.filter(
      (col) => !col.width,
    ).length;
    const first = Math.min(50, (100 / colsWithoutCustomWidth) * firstColMul);
    const remainingWidth = 100 - first;
    const other = remainingWidth / (colsWithoutCustomWidth - 1);
    return { first, other };
  }, [visibleCols, equalColWidth]);

  // The first column which has no custom width. Find it to make it wider.
  const firstColIndex = visibleCols.findIndex((col) => !col.width);
  const hasLeadingCheckbox = Boolean(fieldType || enableMultiSelect);

  const firstVisibleDataIndex = hasOptionalColumns
    ? columnPositions
        .filter((id) => columnMap[id])
        .findIndex((id) => columnMap[id].visible ?? true)
    : columns.findIndex((col) => col.visible ?? true);

  return (
    <>
      <colgroup>
        {fieldType || enableMultiSelect ? (
          <col width="10px" className="print:hidden" />
        ) : null}
        {visibleCols.map((col, i) => (
          <col
            key={i}
            style={
              col.width
                ? { width: col.width }
                : {
                    width:
                      (i === firstColIndex
                        ? colWidths.first
                        : colWidths.other) + '%',
                    minWidth: i === firstColIndex ? 200 : 150,
                  }
            }
          />
        ))}
      </colgroup>
      <thead>
        <tr className="border-b border-solid border-secondary border-b-[color:var(--table-head-border,var(--border-secondary))] [--table-row-bg:var(--table-head-bg,var(--bg-secondary))] bg-[var(--table-row-bg)] text-start text-quaternary font-semibold text-xs align-middle">
          <TableControlHead
            fieldType={fieldType}
            enableMultiSelect={enableMultiSelect}
            rows={rows}
            selectedRows={selectedRows}
            onSelectAllRows={onSelectAllRows}
          />
          {hasOptionalColumns
            ? columnPositions
                .filter((id) => columnMap[id])
                .map(
                  (id, index) =>
                    (columnMap[id].visible ?? true) && (
                      <TableHeaderCell
                        key={id}
                        column={columnMap[id]}
                        onSortClick={onSortClick}
                        currentSorting={currentSorting}
                        filters={filters}
                        filtersStorage={filtersStorage}
                        setFilter={setFilter}
                        applyFiltersFn={applyFiltersFn}
                        toggleFilterMenu={toggleFilterMenu}
                        isFirstDataColumn={index === firstVisibleDataIndex}
                        expandableRow={expandableRow}
                        hideExpandToggle={hideExpandToggle}
                        toggledAll={toggledAll}
                        toggleAll={toggleAll}
                        hasLeadingCheckbox={hasLeadingCheckbox}
                        pinKey={id}
                        pinned={id in pinnedColumns}
                        shadow={pinnedColumns[id]}
                        pinOffset={pinnedOffsets[id]}
                        onTogglePin={toggleColumnPin}
                      />
                    ),
                )
            : columns.map((column, index) => {
                if (!(column.visible ?? true)) {
                  return false;
                }
                const pinKey = getColumnPinKey(column, index);
                return (
                  <TableHeaderCell
                    key={index}
                    column={column}
                    onSortClick={onSortClick}
                    currentSorting={currentSorting}
                    filters={filters}
                    filtersStorage={filtersStorage}
                    setFilter={setFilter}
                    applyFiltersFn={applyFiltersFn}
                    toggleFilterMenu={toggleFilterMenu}
                    isFirstDataColumn={index === firstVisibleDataIndex}
                    expandableRow={expandableRow}
                    hideExpandToggle={hideExpandToggle}
                    toggledAll={toggledAll}
                    toggleAll={toggleAll}
                    hasLeadingCheckbox={hasLeadingCheckbox}
                    pinKey={pinKey}
                    pinned={pinKey in pinnedColumns}
                    shadow={pinnedColumns[pinKey]}
                    pinOffset={pinnedOffsets[pinKey]}
                    onTogglePin={toggleColumnPin}
                  />
                );
              })}
          {showActions ? (
            <TableActionsHead pinnedColumns={pinnedColumns} />
          ) : null}
        </tr>
      </thead>
    </>
  );
};
