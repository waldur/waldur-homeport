import { UseQueryResult } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { translate } from 'waldur-i18n-runtime';
import {
  AppLink,
  BaseButton,
  BreadcrumbTrail,
  Card,
  CardContent,
  CardHeader,
  DataTable,
  DataTableColumn,
  EmptyState,
  LoadingSpinner,
} from 'waldur-ui';

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

const describeError = (error: unknown) => {
  const response = (error as { response?: Response })?.response;
  if (response?.status === 401) {
    return translate('You are not logged in. Log in to the portal first.');
  }
  if (response) {
    return translate('The server answered {status}.', {
      status: response.status,
    });
  }
  return translate('The server could not be reached.');
};

/** The parts of a react-query result a table card reads. */
export type TableQuery<T> = Pick<
  UseQueryResult<unknown>,
  'isLoading' | 'isError' | 'error' | 'refetch'
> & { data?: T[] };

/** The same query showing `data` instead: a slice, or a reshaping of it. */
export const withRows = <T,>(
  query: Pick<
    UseQueryResult<unknown>,
    'isLoading' | 'isError' | 'error' | 'refetch'
  >,
  data: T[] | undefined,
): TableQuery<T> => ({
  isLoading: query.isLoading,
  isError: query.isError,
  error: query.error,
  refetch: query.refetch,
  data,
});

/**
 * A card holding a table fed by one query: spinner while loading, the
 * error with a retry, an empty state, or the rows.
 */
export function QueryTableCard<T>({
  title,
  query,
  columns,
  rowKey,
  emptyMessage,
  footer,
}: {
  title?: ReactNode;
  query: TableQuery<T>;
  columns: DataTableColumn<T>[];
  rowKey: (row: T) => string;
  emptyMessage: string;
  footer?: ReactNode;
}) {
  return (
    <Card>
      {title ? (
        <CardHeader className="p-4 pb-0 text-sm font-semibold text-primary">
          {title}
        </CardHeader>
      ) : null}
      <CardContent className="overflow-x-auto p-0">
        {query.isLoading ? (
          <div className="flex justify-center p-8">
            <LoadingSpinner />
          </div>
        ) : query.isError ? (
          <EmptyState
            title={translate('Could not load this list')}
            message={describeError(query.error)}
            action={
              <BaseButton
                variant="tertiary"
                label={translate('Try again')}
                onClick={() => query.refetch()}
              />
            }
          />
        ) : (query.data ?? []).length === 0 ? (
          <EmptyState message={emptyMessage} />
        ) : (
          <DataTable columns={columns} rows={query.data} rowKey={rowKey} />
        )}
        {footer}
      </CardContent>
    </Card>
  );
}
