import {
  createContext,
  forwardRef,
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
  striped?: boolean;
  scrollable?: boolean;
  containerClassName?: string;
}

/**
 * shadcn's actual Table recipe (a scroll-container div wrapping <table>,
 * plus Header/Body/Row/Head/Cell sub-components — see
 * https://ui.shadcn.com/docs/components/table) — border/hover colors point
 * at waldur-design-tokens/table.css's table tokens and the shared surface tokens
 * instead of shadcn's own default palette. DataTable.tsx's column-def API
 * builds on these rather than rendering a bare <table> itself.
 */
export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  {
    density = 'normal',
    striped = false,
    scrollable = true,
    containerClassName,
    className,
    children,
    ...props
  },
  ref,
) {
  const table = (
    <table
      ref={ref}
      className={cn(
        'w-full text-sm',
        striped &&
          '[&_tbody_tr:nth-child(even)]:bg-[var(--table-row-hover-bg)]',
        className,
      )}
      {...props}
    >
      {children}
    </table>
  );

  return (
    <TableContext.Provider value={{ density }}>
      {scrollable ? (
        <div className={cn('w-full overflow-x-auto', containerClassName)}>
          {table}
        </div>
      ) : (
        table
      )}
    </TableContext.Provider>
  );
});

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(function TableHeader({ className, ...props }, ref) {
  return <thead ref={ref} className={className} {...props} />;
});

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(function TableBody({ className, ...props }, ref) {
  return <tbody ref={ref} className={className} {...props} />;
});

export const TableFooter = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(function TableFooter({ className, ...props }, ref) {
  return (
    <tfoot
      ref={ref}
      className={cn(
        'border-t border-[var(--table-row-border)] bg-secondary font-medium text-primary',
        className,
      )}
      {...props}
    />
  );
});

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  hoverable?: boolean;
  divided?: boolean;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  function TableRow(
    { hoverable = true, divided = true, className, ...props },
    ref,
  ) {
    return (
      <tr
        ref={ref}
        className={cn(
          divided &&
            'border-b border-[var(--table-row-border)] last:border-b-0',
          hoverable && 'hover:bg-[var(--table-row-hover-bg)]',
          className,
        )}
        {...props}
      />
    );
  },
);

export const TableHead = forwardRef<
  HTMLTableCellElement,
  ThHTMLAttributes<HTMLTableCellElement>
>(function TableHead({ className, ...props }, ref) {
  const { density } = useTableContext();
  return (
    <th
      ref={ref}
      className={cn(
        DENSITY_HEAD_CLASSES[density],
        'text-left font-medium text-[var(--table-header-text)]',
        className,
      )}
      {...props}
    />
  );
});

export const TableCell = forwardRef<
  HTMLTableCellElement,
  TdHTMLAttributes<HTMLTableCellElement>
>(function TableCell({ className, ...props }, ref) {
  const { density } = useTableContext();
  return (
    <td
      ref={ref}
      className={cn(DENSITY_CELL_CLASSES[density], 'text-primary', className)}
      {...props}
    />
  );
});

export const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  HTMLAttributes<HTMLTableCaptionElement>
>(function TableCaption({ className, ...props }, ref) {
  return (
    <caption
      ref={ref}
      className={cn('mt-3 text-sm text-[var(--table-header-text)]', className)}
      {...props}
    />
  );
});
