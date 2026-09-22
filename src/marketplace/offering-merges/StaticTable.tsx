import { ReactNode, useEffect, useRef } from 'react';

import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

interface StaticTableProps<RowType> {
  table: string;
  rows: RowType[];
  columns: Column<RowType>[];
  verboseName: string;
  title?: ReactNode;
  rowKey?: string;
  emptyMessage?: ReactNode;
}

/**
 * A table over rows already held in memory: mappings, checks, prices.
 * Rows are compared by content, so callers need not memoise them.
 */
export function StaticTable<RowType>({
  table,
  rows,
  columns,
  verboseName,
  title,
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

  return (
    <Table<RowType>
      {...tableProps}
      columns={columns}
      verboseName={verboseName}
      title={title}
      hideTitle={!title}
      rowKey={rowKey}
      hasActionBar={false}
      hasPagination={false}
      placeholderHasRetry={false}
      emptyMessage={emptyMessage}
    />
  );
}
