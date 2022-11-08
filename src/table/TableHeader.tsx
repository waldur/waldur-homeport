import classNames from 'classnames';
import React from 'react';
import { FormCheck } from 'react-bootstrap';

import './TableHeader.scss';

import { Column, Sorting } from './types';

interface TableHeaderProps {
  columns: Column[];
  onSortClick?(sorting: Sorting): void;
  currentSorting?: Sorting;
  expandableRow?: boolean;
  rows: any[];
  enableMultiSelect?: boolean;
  onSelectAllRows?(rows: any[]): void;
  selectedRows?: any[];
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
    return <i className="fa fa-sort ms-1" />;
  } else if (sorting.mode === 'asc') {
    return <i className="fa fa-sort-asc ms-1" />;
  } else {
    return <i className="fa fa-sort-desc ms-1" />;
  }
}

const TableTh = ({ column, onSortClick, currentSorting }) => (
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
  </th>
);

export const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  onSortClick,
  currentSorting,
  expandableRow,
  rows,
  enableMultiSelect,
  onSelectAllRows,
  selectedRows,
}) => {
  const isAllSelected = selectedRows?.length >= rows?.length;

  return (
    <thead>
      <tr className="text-start text-muted bg-light fw-bolder fs-7 text-uppercase gs-0">
        {enableMultiSelect && (
          <th style={{ width: '10px' }}>
            <FormCheck
              className="form-check form-check-custom form-check-sm"
              checked={isAllSelected}
              onChange={() => onSelectAllRows(rows)}
            />
          </th>
        )}
        {columns && columns[0] && (columns[0].visible ?? true) && (
          <TableTh
            column={columns[0]}
            onSortClick={onSortClick}
            currentSorting={currentSorting}
          />
        )}
        {expandableRow && <th style={{ width: '10px' }} />}
        {columns
          .slice(1)
          .map(
            (column, index) =>
              (column.visible ?? true) && (
                <TableTh
                  key={index}
                  column={column}
                  onSortClick={onSortClick}
                  currentSorting={currentSorting}
                />
              ),
          )}
      </tr>
    </thead>
  );
};

TableHeader.defaultProps = {
  expandableRow: false,
};
