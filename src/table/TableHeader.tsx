import classNames from 'classnames';
import { FC, useEffect, useMemo, useRef } from 'react';
import { FormCheck } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import './TableHeader.scss';

import { TableProps } from './Table';
import { TableFiltersMenu } from './TableFiltersMenu';
import { Column, Sorting } from './types';

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
  fieldType?: TableProps['fieldType'];
  activeColumns?: Record<string, boolean>;
  filters?: TableProps['filters'];
  filtersStorage?: TableProps['filtersStorage'];
  setFilter?: TableProps['setFilter'];
  applyFiltersFn?: TableProps['applyFiltersFn'];
  columnPositions: string[];
  hasOptionalColumns?: boolean;
  toggleFilterMenu(show?): void;
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
          onClick={() => onClickSort('asc')}
          className={classNames(
            'text-btn',
            column.orderField === sorting.field &&
              sorting.mode === 'asc' &&
              'active',
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="8"
            fill="currentColor"
            viewBox="0 0 256 128"
          >
            <path d="M 126 45 l 39.51 39.52 a 12 12 0 0 0 17 -17 l -48 -48 a 12 12 0 0 0 -17 0 l -48 48 a 12 12 0 0 0 17 17 Z" />
          </svg>
        </button>
        <button
          onClick={() => onClickSort('desc')}
          className={classNames(
            'text-btn',
            column.orderField === sorting.field &&
              sorting.mode === 'desc' &&
              'active',
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="8"
            fill="currentColor"
            viewBox="0 0 256 128"
          >
            <path d="M 184.49 39.51 a 12 12 0 0 1 0 17 l -48 48 a 12 12 0 0 1 -17 0 l -48 -48 a 12 12 0 0 1 17 -17 L 128 79 l 39.51 -39.52 A 12 12 0 0 1 184.49 39.51 Z" />
          </svg>
        </button>
      </span>
    </span>
  );
}

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
  fieldType,
  filters,
  filtersStorage,
  setFilter,
  applyFiltersFn,
  hasOptionalColumns,
  toggleFilterMenu,
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

  return (
    <thead>
      <tr className="text-start text-muted fw-bolder fs-7 gs-0 align-middle">
        {fieldType ? (
          <th style={{ width: '10px' }} />
        ) : enableMultiSelect ? (
          <th style={{ width: '10px' }}>
            <FormCheck
              ref={refCheck}
              className="form-check form-check-custom form-check-sm"
              checked={isAllSelected}
              onChange={() => onSelectAllRows(rows)}
            />
          </th>
        ) : null}
        {expandableRow && <th style={{ width: '10px' }} />}
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
          <th className="header-actions">{translate('Actions')}</th>
        ) : null}
      </tr>
    </thead>
  );
};
