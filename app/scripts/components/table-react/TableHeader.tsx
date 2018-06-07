import * as React from 'react';

import './TableHeader.scss';

import { Column, Sorting } from './types';

interface Props {
  columns: Column[];
  onSortClick?: (orderField: string, currentSorting: Sorting) => any;
  currentSorting?: Sorting;
}

const TableHeader = ({ columns, onSortClick, currentSorting }: Props) => (
  <thead>
    <tr>
      {columns.map((column, index) => (
        <th key={index} className={column.orderField ? column.className += ' sorting-column' : column.className}
          onClick={column.orderField && (() => onSortClick(column.orderField, currentSorting))}>
          {column.title}
          {(column.orderField && (currentSorting && column.orderField !== currentSorting.field)) && <i className="fa fa-sort m-l-xs"/>}
          {(currentSorting && column.orderField === currentSorting.field) && <i className={`fa fa-sort-${currentSorting.mode} m-l-xs`}/>}
        </th>
      ))}
    </tr>
  </thead>
);

export default TableHeader;
