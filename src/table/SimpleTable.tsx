import {
  cn,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { Column } from './types';

// The main Table's cell box: 44px rows, 10px gutters. A cell's height is a
// minimum, so a one-line row stays 44px while the vertical padding keeps
// wrapped text and tall controls off the row lines.
const cell = 'h-[44px] px-2.5 py-2.5 align-middle';

/**
 * A short list of rows already in memory, with the main table's look but none
 * of its fetching, paging, sorting or filters.
 */
export const SimpleTable = <T = any,>({
  columns,
  rows,
  rowKey = 'uuid',
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey?: string;
}) => (
  <Table>
    <TableHeader>
      <TableRow className="bg-secondary border-divider last:border-b-[1px] hover:bg-secondary">
        {columns.map((column, index) => (
          <TableHead
            key={index}
            className={cn(
              cell,
              'text-xs font-medium text-quaternary whitespace-nowrap',
              column.headerClassName,
            )}
          >
            {column.title}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {(rows || []).map((row, rowIndex) => (
        <TableRow
          key={row[rowKey as string] || rowIndex}
          className="border-divider hover:bg-transparent"
        >
          {columns.map((column, colIndex) => (
            <TableCell
              key={colIndex}
              className={cn(cell, 'text-quaternary', column.className)}
            >
              <column.render row={row} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
