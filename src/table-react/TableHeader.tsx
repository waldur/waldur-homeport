import * as classNames from 'classnames';
import * as React from 'react';

import './TableHeader.scss';

import { Column, Sorting } from './types';

interface TableHeaderProps {
  columns: Column[];
  onSortClick?(sorting: Sorting): void;
  currentSorting?: Sorting;
  expandableRow?: React.ComponentType<{row: any}>;
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
  return {field, mode};
}

const TableHeader = ({ columns, onSortClick, currentSorting, expandableRow }: TableHeaderProps) => (
  <thead>
    <tr>
      {expandableRow && (
        <th style={{width: '10px'}}/>
      )}
      {columns.map((column, index) => (
        <th
          key={index}
          className={classNames(column.className, column.orderField && 'sorting-column') || undefined}
          onClick={column.orderField && (() => onSortClick(handleOrdering(currentSorting, column.orderField)))}>
          {column.title}
          {(column.orderField && (currentSorting && column.orderField !== currentSorting.field)) && <i className="fa fa-sort m-l-xs"/>}
          {(currentSorting && column.orderField === currentSorting.field) && <i className={`fa fa-sort-${currentSorting.mode} m-l-xs`}/>}
        </th>
      ))}
    </tr>
  </thead>
);

export default TableHeader;
