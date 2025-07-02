import { CaretDownIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, useCallback, useEffect, useMemo, useRef } from 'react';
import { Button, FormCheck } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import './TableHeader.scss';

import { COLUMN_ACTIONS_KEY } from './constants';
import { TableFiltersMenu } from './TableFiltersMenu';
import { TableProps, Column, Sorting, PinnedColumns } from './types';
import { getId } from './utils';

interface TableHeaderProps {
  columns: Column[];
  onSortClick?(sorting: Sorting): void;
  currentSorting?: Sorting;
  expandableRow?: boolean;
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
      <span className="sorting-buttons">
        <button
          type="button"
          data-testid="sort-asc"
          onClick={() => onClickSort('asc')}
          className={classNames(
            'text-btn',
            column.orderField === sorting.field &&
              sorting.mode === 'asc' &&
              'active',
          )}
        >
          <svg width="16" height="8" fill="currentColor" viewBox="0 0 256 128">
            <path d="M 126 45 l 39.51 39.52 a 12 12 0 0 0 17 -17 l -48 -48 a 12 12 0 0 0 -17 0 l -48 48 a 12 12 0 0 0 17 17 Z" />
          </svg>
        </button>
        <button
          type="button"
          data-testid="sort-desc"
          onClick={() => onClickSort('desc')}
          className={classNames(
            'text-btn',
            column.orderField === sorting.field &&
              sorting.mode === 'desc' &&
              'active',
          )}
        >
          <svg width="16" height="8" fill="currentColor" viewBox="0 0 256 128">
            <path d="M 184.49 39.51 a 12 12 0 0 1 0 17 l -48 48 a 12 12 0 0 1 -17 0 l -48 -48 a 12 12 0 0 1 17 -17 L 128 79 l 39.51 -39.52 A 12 12 0 0 1 184.49 39.51 Z" />
          </svg>
        </button>
      </span>
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
        column.className,
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
    if (!expandableRow) return false;
    const toggledRows = Object.values(toggled);
    return toggledRows.length === rows.length && toggledRows.every(Boolean);
  }, [toggled, rows]);

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

  const colsLen = useMemo(() => {
    return hasOptionalColumns
      ? columnPositions.filter(
          (id) => columnMap[id] && (columnMap[id].visible ?? true),
        ).length
      : columns.filter((column) => column.visible ?? true).length;
  }, [hasOptionalColumns, columnPositions, columnMap, columns]);

  return (
    <>
      <colgroup>
        {fieldType ? (
          <col width="10px" />
        ) : enableMultiSelect ? (
          <col width="10px" />
        ) : null}
        {expandableRow && <col width="10px" />}
        {Array.from({ length: colsLen }).map((_, i) => (
          <col
            key={i}
            style={{
              width: (i === 0 ? (100 / colsLen) * 2 : 100 / colsLen) + '%',
              minWidth: i === 0 ? 200 : 150,
            }}
          />
        ))}
      </colgroup>
      <thead>
        <tr className="text-start text-muted fw-bolder fs-7 gs-0 align-middle">
          {fieldType ? (
            <th style={{ width: '10px' }} />
          ) : enableMultiSelect ? (
            <th style={{ width: '10px' }}>
              <FormCheck
                ref={refCheck}
                data-testid="select-all"
                className="form-check form-check-custom form-check-sm"
                checked={isAllSelected}
                onChange={() => onSelectAllRows(rows)}
              />
            </th>
          ) : null}
          {expandableRow && (
            <th data-testid="all-rows-expander" style={{ width: '10px' }}>
              <Button
                variant="flush"
                className={classNames(
                  'btn-no-focus',
                  toggledAll ? 'active' : '',
                )}
                onClick={toggleAll}
              >
                <CaretDownIcon size={20} weight="bold" className="rotate-180" />
              </Button>
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
