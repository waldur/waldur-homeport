import { CaretUpDown } from '@phosphor-icons/react';
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
}

function handleOrdering(currentSorting: Sorting, field: string): Sorting {
  let mode: 'asc' | 'desc' = 'asc';
  if (field === currentSorting.field) {
    if (currentSorting.mode === 'asc') {
      mode = 'desc';
    } else if (currentSorting.mode === 'desc') {
      mode = 'asc';
    }
  }
  return { field, mode };
}

function renderSortingIcon(column: Column, sorting: Sorting) {
  if (!column.orderField || !sorting) {
    return null;
  }
  return (
    <CaretUpDown
      size={16}
      weight="bold"
      className={column.orderField === sorting.field ? sorting.mode : undefined}
    />
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
}) => (
  <th
    className={
      classNames(
        column.className,
        column.orderField && 'sorting-column',
        column.filter && filters && 'filter-column',
      ) || undefined
    }
    onClick={
      column.orderField &&
      (() => onSortClick(handleOrdering(currentSorting, column.orderField)))
    }
  >
    {column.title}
    {renderSortingIcon(column, currentSorting)}
    {column.filter && filters && (
      <TableFiltersMenu
        filters={filters}
        filterPosition="menu"
        filtersStorage={filtersStorage}
        setFilter={setFilter}
        applyFiltersFn={applyFiltersFn}
        openName={column.filter}
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
