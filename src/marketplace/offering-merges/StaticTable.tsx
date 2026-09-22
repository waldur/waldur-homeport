import { ReactNode, useEffect, useRef } from 'react';

import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

import { SectionHeading } from './SectionHeading';

interface StaticTableProps<RowType> {
  table: string;
  rows: RowType[];
  columns: Column<RowType>[];
  verboseName: string;
  title?: ReactNode;
  /** One or two sentences explaining the table, shown on the heading. */
  help?: ReactNode;
  rowKey?: string;
  emptyMessage?: ReactNode;
}

/**
 * A table over rows already held in memory: mappings, checks, prices.
 * Rows are compared by content, so callers need not memoise them.
 *
 * The heading is rendered here rather than handed to `Table`: the shared table
 * draws its title inside the action bar, which these tables switch off, so a
 * title passed down would never appear.
 */
export function StaticTable<RowType>({
  table,
  rows,
  columns,
  verboseName,
  title,
  help,
  rowKey,
  emptyMessage,
}: StaticTableProps<RowType>) {
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const tableProps = useTable<RowType>({
    table,
    fetchData: () =>
      Promise.resolve({
        rows: rowsRef.current,
        resultCount: rowsRef.current.length,
      }),
  });
  const { fetch } = tableProps;
  const rowsKey = JSON.stringify(rows);
  useEffect(() => {
    fetch();
  }, [rowsKey, fetch]);

  const content = (
    <Table<RowType>
      {...tableProps}
      columns={columns}
      verboseName={verboseName}
      hideTitle
      rowKey={rowKey}
      hasActionBar={false}
      hasPagination={false}
      placeholderHasRetry={false}
      emptyMessage={emptyMessage}
    />
  );

  if (!title) {
    return content;
  }
  return (
    <div className="d-flex flex-column gap-3">
      <SectionHeading title={title} help={help} className="mb-0" />
      {content}
    </div>
  );
}
