import React, { FunctionComponent, useCallback } from 'react';

import { Column } from './types';

interface TableBodyProps {
  rows: any[];
  columns: Column[];
  expandableRow?: React.ComponentType<{ row: any }>;
  toggleRow(row: any): void;
  toggled: object;
}

const TableCells = ({ row, columns }) => (
  <>
    {columns.map(
      (column, colIndex) =>
        (column.visible ?? true) && (
          <td key={colIndex} className={column.className}>
            {React.createElement(column.render, { row })}
          </td>
        ),
    )}
  </>
);

export const TableBody: FunctionComponent<TableBodyProps> = ({
  rows,
  columns,
  expandableRow,
  toggleRow,
  toggled,
}) => {
  const trClick = useCallback(
    (row, e) => {
      if (!expandableRow) return;
      // prevent expandable row to toggle when clicking on inner clickable elements
      const el = e.target as HTMLElement;
      if (el.onclick) return;
      toggleRow(row.uuid);
    },
    [toggleRow],
  );

  return (
    <tbody>
      {rows.map((row, rowIndex) => (
        <React.Fragment key={rowIndex}>
          <tr onClick={(event) => trClick(row, event)}>
            {expandableRow && (
              <td>
                {toggled[row.uuid] ? (
                  <i className="fa fa-chevron-down" />
                ) : (
                  <i className="fa fa-chevron-right" />
                )}
              </td>
            )}
            <TableCells row={row} columns={columns} />
          </tr>
          {expandableRow && toggled[row.uuid] && (
            <tr>
              <td colSpan={columns.length + 1}>
                {React.createElement(expandableRow, { row })}
              </td>
            </tr>
          )}
        </React.Fragment>
      ))}
    </tbody>
  );
};
