import {
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from 'react';

import { cn } from './cn';

/**
 * shadcn's actual Table recipe (a scroll-container div wrapping <table>,
 * plus Header/Body/Row/Head/Cell sub-components — see
 * https://ui.shadcn.com/docs/components/table) — border/hover colors point
 * at waldur-design-tokens/surfaceColors.css's table and surface tokens
 * instead of shadcn's own default palette. DataTable.tsx's column-def API
 * builds on these rather than rendering a bare <table> itself.
 */
export function Table({
  className,
  ...props
}: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full text-sm', className)} {...props} />
    </div>
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
  return (
    <th
      className={cn(
        'px-4 py-3 text-left font-medium text-[var(--table-header-text)]',
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
  return (
    <td
      className={cn('px-4 py-3 text-[var(--surface-text-primary)]', className)}
      {...props}
    />
  );
}
