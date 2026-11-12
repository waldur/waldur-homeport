import { UseQueryResult } from '@tanstack/react-query';
import { FC, ReactNode, useRef } from 'react';
import { translate } from 'waldur-i18n-runtime';
import { Column, Table, TableProps, useRowsTable } from 'waldur-table';
import { AppLink, BreadcrumbTrail } from 'waldur-ui';

import { navigate, pageHref } from './router';

export const PageHeader = ({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <BreadcrumbTrail
        items={[
          {
            key: 'app',
            text: translate('Calls'),
            onClick: () => navigate(pageHref('inbox')),
          },
          { key: 'page', text: title, active: true },
        ]}
      />
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-1 text-sm text-quaternary">{description}</p>
    </div>
    {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
  </div>
);

const LINK_CLASS = 'text-brand hover:underline';

/**
 * Links are waldur-ui's AppLink, drawn by the LinkProvider in App.tsx: an
 * href of one of this app's pages navigates client-side, any other (the
 * portal's) is a plain link that leaves the app.
 */
export const InternalLink = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => (
  <AppLink to={href} className={LINK_CLASS}>
    {children}
  </AppLink>
);

/** A link into the main portal; plain text when there is nowhere to go. */
export const PortalLink = ({
  href,
  children,
}: {
  href: string | null;
  children: ReactNode;
}) =>
  href ? (
    <AppLink to={href} className={LINK_CLASS}>
      {children}
    </AppLink>
  ) : (
    <>{children}</>
  );

/** The parts of a react-query result a table reads. */
export type TableQuery<T> = Pick<
  UseQueryResult<unknown>,
  'isLoading' | 'isError' | 'error' | 'refetch' | 'dataUpdatedAt'
> & { data?: T[] };

/** The same query showing `data` instead: a slice, or a reshaping of it. */
export const withRows = <T,>(
  query: Pick<
    UseQueryResult<unknown>,
    'isLoading' | 'isError' | 'error' | 'refetch' | 'dataUpdatedAt'
  >,
  data: T[] | undefined,
): TableQuery<T> => ({
  isLoading: query.isLoading,
  isError: query.isError,
  error: query.error,
  refetch: query.refetch,
  dataUpdatedAt: query.dataUpdatedAt,
  data,
});

/**
 * The pages build their columns on every render, so that the titles follow
 * the language once its dictionary loads. The table mounts a column's
 * `render` as a component, and a new function each render would remount
 * every cell, dropping a row action's pending state. So each column keeps
 * one component, which draws with the latest `render`.
 */
export const useStableColumns = <T,>(columns: Column<T>[]): Column<T>[] => {
  const latest = useRef(columns);
  latest.current = columns;
  const renderers = useRef<FC<{ row: T }>[]>([]);
  return columns.map((column, index) => {
    renderers.current[index] ??= (props) =>
      (latest.current[index].render as FC<{ row: T }>)(props);
    return { ...column, render: renderers.current[index] };
  });
};

// Sorting is the server's: a column's `orderField` names an endpoint
// ordering, which rows held in memory cannot follow.
const withoutSorting = <T,>(column: Column<T>): Column<T> => ({
  ...column,
  orderField: undefined,
});

// One array for "no rows yet", so the table does not start over every render.
const NO_ROWS = [];

/**
 * For the lists whose endpoint is not paginated, or whose rows are reshaped
 * here, and for the inbox's previews; a paginated list fetches its own pages
 * (`useTable` with `createFetcher`, see RequestsPage).
 *
 * The shared table over a list one query fetched whole: the table pages the
 * rows in the browser and draws every state itself (its spinner while the
 * query loads, its error view, its empty state with `emptyMessage`).
 * Refresh, in the title bar and in the empty state, runs the query again.
 * Takes the table's own props: `title`, `footer`, `rowKey`, `hasPagination`
 * (false for a preview of a few rows), …
 */
export function QueryTable<T>({
  table,
  query,
  columns,
  title,
  ...rest
}: {
  /** The table's name in the tables store: one per list on screen. */
  table: string;
  query: TableQuery<T>;
  columns: Column<T>[];
} & Pick<
  TableProps<T>,
  'title' | 'footer' | 'rowKey' | 'hasPagination' | 'emptyMessage'
>) {
  const tableProps = useRowsTable<T>(
    table,
    query.data ?? NO_ROWS,
    query.dataUpdatedAt,
  );
  return (
    <Table
      {...tableProps}
      columns={useStableColumns(columns).map(withoutSorting)}
      loading={query.isLoading || tableProps.loading}
      error={query.isError ? query.error : tableProps.error}
      fetch={() => {
        query.refetch();
      }}
      title={title}
      // The bar holds the title and Refresh; a list under a page header
      // that already names it has neither.
      hasActionBar={Boolean(title)}
      {...rest}
    />
  );
}
