import { CaretDownIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, useCallback, useEffect, useMemo, useRef } from 'react';
import { FormCheck } from 'react-bootstrap';

import { IconButton } from '@waldur/core/buttons/IconButton';
import { CaretUpDownButtons } from '@waldur/core/CaretUpDownButtons';
import { translate } from '@waldur/i18n';

import { COLUMN_ACTIONS_KEY } from './constants';
import { TableFiltersMenu } from './TableFiltersMenu';
import { TableProps, Column, Sorting, PinnedColumns } from './types';
import { getId } from './utils';

import './TableHeader.scss';

interface TableHeaderProps {
  columns: Column[];
  onSortClick?(sorting: Sorting): void;
  currentSorting?: Sorting;
  expandableRow?: boolean;
  hideExpandAllHeader?: boolean;
  showActions?: boolean;
  rows: any[];
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
}

function renderSortingIcon(
  column: Column,
  sorting: Sorting,
  sort: TableHeaderProps['onSortClick'],
) {
  if (!column.orderField || !sorting) {
    return null;
  }
  const onClickSort = (mode: Sorting['mode']) =>
    (column.orderField !== sorting.field || sorting.mode !== mode) &&
    sort({ field: column.orderField, mode });

  return (
    <span>
      <CaretUpDownButtons
        className="sorting-buttons"
        onClickUp={() => onClickSort('asc')}
        onClickDown={() => onClickSort('desc')}
        upClassName={
          column.orderField === sorting.field &&
          sorting.mode === 'asc' &&
          'active'
        }
        downClassName={
          column.orderField === sorting.field &&
          sorting.mode === 'desc' &&
          'active'
        }
        upTestId="sort-asc"
        downTestId="sort-desc"
      />
    </span>
  );
}

const WithThMeta = (children, meta) =>
  meta ? (
    <div className="th-wrapper">
      {children}
      {meta}
    </div>
  ) : (
    children
  );

const TableTh = ({
  column,
  onSortClick,
  currentSorting,
  filters,
  filtersStorage,
  setFilter,
  applyFiltersFn,
  toggleFilterMenu,
}) => (
  <th
    className={
      classNames(
        column.orderField && 'sorting-column',
        column.filter && filters && 'filter-column',
      ) || undefined
    }
  >
    {WithThMeta(
      <>
        <span>
          {column.title}
          {renderSortingIcon(column, currentSorting, onSortClick)}
        </span>
        {column.filter && filters && (
          <TableFiltersMenu
            filters={filters}
            filterPosition="menu"
            filtersStorage={filtersStorage}
            setFilter={setFilter}
            applyFiltersFn={applyFiltersFn}
            openName={column.filter}
            toggleFilterMenu={toggleFilterMenu}
          />
        )}
      </>,
      column.meta,
    )}
  </th>
);

export const TableHeader: FC<TableHeaderProps> = ({
  columns,
  columnPositions,
  onSortClick,
  currentSorting,
  expandableRow = false,
  hideExpandAllHeader = false,
  showActions,
  rows,
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
}) => {
  const isAllSelected = selectedRows?.length >= rows?.length;

  const columnMap = useMemo(
    () =>
      columns.reduce(
        (result, column) => ({ ...result, [column.id]: column }),
        {},
      ),
    [columns],
  );

  const refCheck = useRef<HTMLInputElement>();
  useEffect(() => {
    if (refCheck?.current) {
      refCheck.current.indeterminate =
        !isAllSelected && selectedRows?.length > 0;
    }
  }, [refCheck?.current, isAllSelected, selectedRows]);

  const toggledAll = useMemo(() => {
    if (!expandableRow || rows.length === 0) return false;
    return rows.every((row, i) => toggled[getId(row, i)]);
  }, [toggled, getId, rows, expandableRow]);

  const toggleAll = useCallback(() => {
    if (toggledAll) {
      rows.forEach((row, i) => {
        toggleRow(getId(row, i));
      });
    } else {
      rows.forEach((row, i) => {
        const rowId = getId(row, i);
        if (!toggled[rowId]) toggleRow(rowId);
      });
    }
  }, [rows, toggledAll, toggled, toggleRow]);

  const visibleCols = useMemo<Column[]>(() => {
    return hasOptionalColumns
      ? columnPositions
          .filter((id) => columnMap[id] && (columnMap[id].visible ?? true))
          .map((id) => columnMap[id])
      : columns.filter((column) => column.visible ?? true);
  }, [hasOptionalColumns, columnPositions, columnMap, columns]);

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
  }, [visibleCols]);

  // The first column which has no custom width. Find it to make it wider.
  const firstColIndex = visibleCols.findIndex((col) => !col.width);

  return (
    <>
      <colgroup>
        {fieldType || enableMultiSelect ? <col width="10px" /> : null}
        {expandableRow && <col width="10px" />}
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
        <tr className="text-start text-muted fw-bolder fs-7 gs-0 align-middle">
          {fieldType ? (
            <th style={{ width: '10px', paddingLeft: '16px' }} />
          ) : enableMultiSelect ? (
            <th style={{ width: '10px', paddingLeft: '16px' }}>
              <FormCheck
                ref={refCheck}
                data-testid="select-all"
                className="form-check form-check-custom form-check-md"
                checked={isAllSelected}
                onChange={() => onSelectAllRows(rows)}
              />
            </th>
          ) : null}
          {expandableRow && (
            <th
              data-testid="all-rows-expander"
              style={{ width: '10px' }}
              className={hideExpandAllHeader ? 'empty-expand-header' : ''}
            >
              {!hideExpandAllHeader && (
                <IconButton
                  iconNode={
                    <CaretDownIcon
                      size={20}
                      weight="bold"
                      className="rotate-180"
                    />
                  }
                  tooltip={
                    toggledAll
                      ? translate('Collapse all rows')
                      : translate('Expand all rows')
                  }
                  onClick={toggleAll}
                  variant="flush"
                  className={classNames(
                    'btn-no-focus',
                    toggledAll ? 'active' : '',
                  )}
                />
              )}
            </th>
          )}
          {hasOptionalColumns
            ? columnPositions
                .filter((id) => columnMap[id])
                .map(
                  (id) =>
                    (columnMap[id].visible ?? true) && (
                      <TableTh
                        key={id}
                        column={columnMap[id]}
                        onSortClick={onSortClick}
                        currentSorting={currentSorting}
                        filters={filters}
                        filtersStorage={filtersStorage}
                        setFilter={setFilter}
                        applyFiltersFn={applyFiltersFn}
                        toggleFilterMenu={toggleFilterMenu}
                      />
                    ),
                )
            : columns.map(
                (column, index) =>
                  (column.visible ?? true) && (
                    <TableTh
                      key={index}
                      column={column}
                      onSortClick={onSortClick}
                      currentSorting={currentSorting}
                      filters={filters}
                      filtersStorage={filtersStorage}
                      setFilter={setFilter}
                      applyFiltersFn={applyFiltersFn}
                      toggleFilterMenu={toggleFilterMenu}
                    />
                  ),
              )}
          {showActions ? (
            <th
              className={classNames(
                'header-actions',
                COLUMN_ACTIONS_KEY in pinnedColumns && 'pinned',
                pinnedColumns[COLUMN_ACTIONS_KEY] && 'is-floating',
              )}
            >
              {translate('Actions')}
            </th>
          ) : null}
        </tr>
      </thead>
    </>
  );
};
