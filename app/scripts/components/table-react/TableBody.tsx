import * as React from 'react';

import { Column } from './types';

type Props = {
  rows: any[],
  columns: Column[],
};

const TableBody = ({ rows, columns }: Props) => (
  <tbody>
    {rows.map((row, i) => (
      <tr key={i}>
        {columns.map((column, j) => (
          <td key={j} className={column.className}>
            {React.createElement(column.render, { row })}
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);

export default TableBody;
