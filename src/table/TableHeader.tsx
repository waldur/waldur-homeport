import { CaretDown, CaretUp, CaretUpDown } from '@phosphor-icons/react';
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
  } else if (column.orderField !== sorting.field) {
    return <CaretUpDown size={17} width={30} />;
  } else if (sorting.mode === 'asc') {
    return <CaretUp size={17} width={30} />;
  } else {
    return <CaretDown size={17} width={30} />;
  }
}

const TableTh = ({
  column,
  onSortClick,
  currentSorting,
  filters,
  setFilter,
  applyFiltersFn,
}) => (
  <th
    className={
      classNames(column.className, column.orderField && 'sorting-column') ||
      undefined
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
      <tr className="text-start text-muted bg-light fw-bolder fs-7 text-uppercase gs-0">
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
