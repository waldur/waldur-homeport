import * as classNames from 'classnames';
import * as React from 'react';

import './TableHeader.scss';

import { Column, Sorting } from './types';

interface TableHeaderProps {
  columns: Column[];
  onSortClick?(sorting: Sorting): void;
  currentSorting?: Sorting;
  expandableRow?: boolean;
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
    return <i className="fa fa-sort m-l-xs" />;
  } else if (sorting.mode === 'asc') {
    return <i className="fa fa-sort-asc m-l-xs" />;
  } else {
    return <i className="fa fa-sort-desc m-l-xs" />;
  }
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  onSortClick,
  currentSorting,
  expandableRow,
}) => (
  <thead>
    <tr>
      {expandableRow && <th style={{ width: '10px' }} />}
      {columns.map((column, index) => (
        <th
          key={index}
          className={
            classNames(
              column.className,
              column.orderField && 'sorting-column',
            ) || undefined
          }
          onClick={
            column.orderField &&
            (() =>
              onSortClick(handleOrdering(currentSorting, column.orderField)))
          }
        >
          {column.title}
          {renderSortingIcon(column, currentSorting)}
        </th>
      ))}
    </tr>
  </thead>
);

TableHeader.defaultProps = {
  expandableRow: false,
};
