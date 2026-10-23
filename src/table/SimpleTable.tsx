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

// The main Table's cell box: 44px rows, ~10px gutters. Arbitrary values, not
// px-2/py-0: Bootstrap's own .px-2/.py-0 are !important and would win.
const cell = 'h-[44px] px-[10px] py-[0px] align-middle';

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
