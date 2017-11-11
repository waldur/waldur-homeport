import React from 'react';
import { Column } from './types';

type Props = {
  rows: Array<any>,
  columns: Array<Column>,
};

const TableBody = ({ rows, columns }: Props) => (
  <tbody>
    {rows.map((row, index) => (
      <tr key={index}>
        {columns.map((column, index) => (
          <td key={index} className={column.className}>
            {React.createElement(column.render, { row })}
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);

export default TableBody;
