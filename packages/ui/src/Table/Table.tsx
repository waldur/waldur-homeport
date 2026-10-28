import {
  createContext,
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
  useContext,
} from 'react';

import { cn } from '../cn';

export type TableDensity = 'compact' | 'normal' | 'spacious';

interface TableContextValue {
  density: TableDensity;
}

const TableContext = createContext<TableContextValue>({ density: 'normal' });

export const useTableContext = () => useContext(TableContext);

const DENSITY_HEAD_CLASSES: Record<TableDensity, string> = {
  compact: 'px-2.5 py-1.5 text-xs',
  normal: 'px-3 py-2.5 text-sm',
  spacious: 'px-4 py-3.5 text-sm',
};

const DENSITY_CELL_CLASSES: Record<TableDensity, string> = {
  compact: 'px-2.5 py-1.5 text-xs',
  normal: 'px-3 py-2.5 text-sm',
  spacious: 'px-4 py-3.5 text-sm',
};

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  density?: TableDensity;
}

/**
 * shadcn's actual Table recipe (a scroll-container div wrapping <table>,
 * plus Header/Body/Row/Head/Cell sub-components — see
 * https://ui.shadcn.com/docs/components/table) — border/hover colors point
 * at waldur-design-tokens/table.css's table tokens and the shared surface tokens
 * instead of shadcn's own default palette. DataTable.tsx's column-def API
 * builds on these rather than rendering a bare <table> itself.
 */
export function Table({
  density = 'normal',
  className,
  children,
  ...props
}: TableProps) {
  return (
    <TableContext.Provider value={{ density }}>
      <div className="w-full overflow-x-auto">
        <table className={cn('w-full text-sm', className)} {...props}>
          {children}
        </table>
      </div>
    </TableContext.Provider>
  );
}

export function TableHeader({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={className} {...props} />;
}

export function TableBody({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className} {...props} />;
}

export function TableRow({
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'border-b border-[var(--table-row-border)] last:border-b-0 hover:bg-[var(--table-row-hover-bg)]',
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  const { density } = useTableContext();
  return (
    <th
      className={cn(
        DENSITY_HEAD_CLASSES[density],
        'text-left font-medium text-[var(--table-header-text)]',
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  const { density } = useTableContext();
  return (
    <td
      className={cn(DENSITY_CELL_CLASSES[density], 'text-primary', className)}
      {...props}
    />
  );
}
