import BaseTable, { TableLoaderProps } from './BaseTable';
import { TableNav } from './TableNav';

export type { TableColumns, TableLoaderProps } from './BaseTable';

/**
 * Homeport's table: `BaseTable`, with `tabs` rendered as UI-Router links
 * (`TableNav`) above the rows. `BaseTable` itself needs no router.
 */
export default function Table<RowType = any>({
  tabs,
  nav,
  ...props
}: TableLoaderProps<RowType>) {
  return (
    <BaseTable<RowType>
      {...props}
      nav={nav ?? (tabs?.length ? <TableNav tabs={tabs} /> : undefined)}
    />
  );
}
