import { ReactNode } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './Table';

/**
 * A new dashboard primitive, built on the shadcn-recipe Table primitives
 * (see Table.tsx) — deliberately NOT a port of src/table/Table.tsx +
 * useTable, which is the mandated pattern for tables in waldur-homeport's
 * own src/ (see CLAUDE.md) but is deeply coupled to Redux (the table
 * store), Bootstrap, and homeport-internal fetch/filter/pagination
 * plumbing — none of which a standalone micro-app should pull in. This is
 * structure and styling only: no sorting, filtering, pagination, or
 * loading/empty states yet. Extend it (or reach for something like
 * @tanstack/react-table underneath, still without the src/table/
 * dependency) when a real consumer needs those, rather than guessing the
 * shape upfront.
 */
export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  className,
}: DataTableProps<T>) {
  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={col.key} className={col.className}>
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={rowKey(row)}>
            {columns.map((col) => (
              <TableCell key={col.key} className={col.className}>
                {col.render(row)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
