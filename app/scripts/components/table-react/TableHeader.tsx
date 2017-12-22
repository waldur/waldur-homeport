import * as React from 'react';

import { Column } from './types';

interface Props {
  columns: Column[];
}

const TableHeader = ({ columns }: Props) => (
  <thead>
    <tr>
      {columns.map((column, index) => (
        <th key={index} className={column.className}>{column.title}</th>
      ))}
    </tr>
  </thead>
);

export default TableHeader;
