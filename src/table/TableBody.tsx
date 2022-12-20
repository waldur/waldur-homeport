import classNames from 'classnames';
import React, { FunctionComponent, useCallback } from 'react';
import { FormCheck } from 'react-bootstrap';

import { Column } from './types';
import { getId } from './utils';

interface TableBodyProps {
  rows: any[];
  columns: Column[];
  rowClass?: (({ row }) => string) | string;
  expandableRow?: React.ComponentType<{ row: any }>;
  hoverableRow?: React.ComponentType<{ row: any }>;
  enableMultiSelect?: boolean;
  onSelectRow?(row: any): void;
  selectedRows?: any[];
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
  rowClass,
  expandableRow,
  hoverableRow,
  enableMultiSelect,
  onSelectRow,
  selectedRows,
  toggleRow,
  toggled,
}) => {
  const trClick = useCallback(
    (row, index, e) => {
      if (!expandableRow) return;
      // prevent expandable row to toggle when clicking on inner clickable elements
      const el = e.target as HTMLElement;
      if (
        el.onclick ||
        el instanceof HTMLInputElement ||
        el.closest('button, a')
      )
        return;
      toggleRow(getId(row, index));
    },
    [toggleRow],
  );

  const isRowSelected = (row: any) => {
    return selectedRows.some((item) => item.uuid === row.uuid);
  };

  return (
    <tbody>
      {rows.map((row, rowIndex) => (
        <React.Fragment key={rowIndex}>
          <tr
            className={
              classNames(
                expandableRow && toggled[getId(row, rowIndex)]
                  ? 'expanded'
                  : undefined,
                typeof rowClass === 'function' ? rowClass({ row }) : rowClass,
              ) || undefined
            }
            onClick={(event) => trClick(row, rowIndex, event)}
          >
            {enableMultiSelect && (
              <td>
                <FormCheck
                  className="form-check form-check-custom form-check-sm"
                  checked={isRowSelected(row)}
                  onChange={() => onSelectRow(row)}
                />
              </td>
            )}
            {columns && columns[0] && (columns[0].visible ?? true) && (
              <td className={columns[0].className}>
                {React.createElement(columns[0].render, { row })}
              </td>
            )}
            {expandableRow && (
              <td>
                {toggled[getId(row, rowIndex)] ? (
                  <i className="fa fa-chevron-down" />
                ) : (
                  <i className="fa fa-chevron-right" />
                )}
              </td>
            )}
            <TableCells row={row} columns={columns.slice(1)} />
            {hoverableRow && (
              <td className="row-actions">
                {React.createElement(hoverableRow, { row })}
              </td>
            )}
          </tr>
          {expandableRow && toggled[getId(row, rowIndex)] && (
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
