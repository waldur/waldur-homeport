import {
  ComponentType,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import { Link } from '@/core/Link';
import { createClientPaginatedFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column, TableRequest } from '@/table/types';
import { useTable } from '@/table/useTable';

interface ReportTableProps<T> {
  table: string;
  rows: T[];
  columns: Column<T>[];
  title: ReactNode;
  verboseName: string;
  /** The row field the search box matches; no search box without it. */
  queryField?: string;
  rowKey?: string;
  expandableRow?: ComponentType<{ row: T; fetch }>;
  /** Off for a short list whose order means something, split by no pager. */
  hasPagination?: boolean;
}

/**
 * A report's rows as the app's table: paged, sorted and searched in memory,
 * with export. It pages again when the report brings new rows. Refreshing
 * the report is its card's to do: the table's `fetch` only pages, and the
 * table calls it on its own whenever it mounts, sorts or turns a page.
 */
export const ReportTable = <T,>({
  table,
  rows,
  columns,
  title,
  verboseName,
  queryField,
  rowKey = 'uuid',
  expandableRow,
  hasPagination = true,
}: ReportTableProps<T>) => {
  // The table registers its fetcher once, on mount, and exports through
  // that one: it reads the rows through a ref, so a refreshed report exports
  // its new rows.
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const fetchData = useCallback(
    (request: TableRequest) => {
      const current = rowsRef.current;
      const pages = createClientPaginatedFetcher(current, { queryField });
      // Without a pager every row is one page: the table's page size would
      // still cut the list at ten.
      return hasPagination
        ? pages(request)
        : pages({
            ...request,
            currentPage: 1,
            pageSize: Math.max(current.length, 1),
          });
    },
    [queryField, hasPagination],
  );
  const tableProps = useTable<T>({ table, fetchData, queryField });

  const { fetch } = tableProps;
  useEffect(() => {
    fetch();
  }, [rows, fetch]);

  return (
    <Table<T>
      {...tableProps}
      // The report card has the one Refresh, for tiles, charts and table.
      hideRefresh
      columns={columns}
      title={title}
      verboseName={verboseName}
      rowKey={rowKey}
      // Inside the report's card: no card of its own, and flush with the
      // tiles and charts above it. Its toolbar keeps the search and export.
      cardBordered={false}
      className="min-w-0 max-w-full border-0 shadow-none bg-transparent [--card-padding-x:0px]"
      hasQuery={Boolean(queryField)}
      showPageSizeSelector={hasPagination}
      hasPagination={hasPagination}
      enableExport
      expandableRow={expandableRow}
    />
  );
};

/** The call's management page, where the manager works on it. */
export const CallLink = ({ uuid, name }: { uuid: string; name: string }) => (
  <Link state="protected-call.manage" params={{ call_uuid: uuid }}>
    {name}
  </Link>
);

/** The call's rounds, listed on its edit page: rounds have no page alone. */
export const RoundLink = ({
  callUuid,
  name,
}: {
  callUuid: string;
  name: string;
}) => (
  <Link
    state="protected-call.main"
    params={{ call_uuid: callUuid, tab: 'rounds' }}
  >
    {name}
  </Link>
);
