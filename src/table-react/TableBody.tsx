import * as React from 'react';

import { Column } from './types';

interface TableBodyProps {
  rows: any[];
  columns: Column[];
  expandableRow?: React.ComponentType<{row: any}>;
  toggleRow(row: any): void;
  toggled: object;
}

const TableCells = ({ row, columns }) => (
  <>
    {columns.map((column, colIndex) => (
      <td key={colIndex} className={column.className}>
        {React.createElement(column.render, { row })}
      </td>
    ))}
  </>
);

export const TableBody = ({ rows, columns, expandableRow, toggleRow, toggled }: TableBodyProps) => (
  <tbody>
    {rows.map((row, rowIndex) => (
      <React.Fragment key={rowIndex}>
        <tr>
          {expandableRow && (
            <td onClick={() => toggleRow(row.uuid)}>
              {toggled[row.uuid] ? (
                <i className="fa fa-chevron-down"/>
              ) : (
                <i className="fa fa-chevron-right"/>
              )}
            </td>
          )}
          <TableCells row={row} columns={columns}/>
        </tr>
        {expandableRow && toggled[row.uuid] && (
          <tr>
            <td colSpan={columns.length + 1}>
              {React.createElement(expandableRow, {row})}
            </td>
          </tr>
        )}
      </React.Fragment>
    ))}
  </tbody>
);
