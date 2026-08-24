import { useQuery } from '@tanstack/react-query';
import { FC, useEffect, useMemo } from 'react';
import {
  marketplaceOfferingUsersPosixIdentitiesList,
  UserPosixIdentity,
} from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { createClientPaginatedFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

const NAMESPACE_LABELS = {
  uid: () => translate('UID'),
  gid: () => translate('GID'),
};

// A value not tracked by a pool has no scope; the row shows a dash instead.
const POOL_SCOPE_LABELS = {
  offering: () => translate('Offering'),
  service_provider: () => translate('Service provider'),
};

// The sharing offerings live in a list, and the client-side fetcher searches a
// single scalar field, so the names are flattened once for both search and
// display.
interface SearchableIdentity extends UserPosixIdentity {
  offering_names: string;
}

const IdentitiesTable: FC<{ rows: UserPosixIdentity[] }> = ({ rows }) => {
  const searchableRows: SearchableIdentity[] = useMemo(
    () =>
      rows.map((row) => ({
        ...row,
        offering_names: (row.offerings ?? [])
          .map((offering) => offering.name)
          .join(', '),
      })),
    [rows],
  );

  // The endpoint returns the user's complete list rather than a page, so it is
  // paginated and searched in the browser.
  const tableProps = useTable({
    table: 'user-posix-identities',
    fetchData: createClientPaginatedFetcher(searchableRows, {
      queryField: 'offering_names',
    }),
    queryField: 'offering_names',
  });

  useEffect(() => {
    tableProps.fetch();
  }, [searchableRows]);

  const columns = useMemo(
    () => [
      {
        title: translate('Offerings'),
        render: ({ row }: { row: SearchableIdentity }) => (
          <>{renderFieldOrDash(row.offering_names)}</>
        ),
      },
      {
        title: translate('Type'),
        render: ({ row }: { row: SearchableIdentity }) => (
          <>
            {NAMESPACE_LABELS[row.namespace]?.() ??
              renderFieldOrDash(row.namespace)}
          </>
        ),
      },
      {
        title: translate('Value'),
        render: ({ row }: { row: SearchableIdentity }) => <>{row.value}</>,
        copyField: (row: SearchableIdentity) => String(row.value),
      },
      {
        title: translate('Pool scope'),
        render: ({ row }: { row: SearchableIdentity }) => (
          <>
            {row.pool_uuid
              ? (POOL_SCOPE_LABELS[row.pool_scope]?.() ?? row.pool_scope)
              : renderFieldOrDash(null)}
          </>
        ),
      },
      {
        title: translate('Project'),
        render: ({ row }: { row: SearchableIdentity }) => (
          <>{renderFieldOrDash(row.context)}</>
        ),
      },
    ],
    [],
  );

  return (
    <Table<SearchableIdentity>
      {...tableProps}
      columns={columns}
      verboseName={translate('POSIX identifiers')}
      hideTitle
      hasQuery
      placeholderComponent={
        <p className="text-secondary mb-0">
          {translate('No POSIX identifiers found.')}
        </p>
      }
      hideRefresh
      minHeight="auto"
    />
  );
};

export const UserPosixIdentitiesDialog: FC<{
  resolve: { userUuid: string };
}> = ({ resolve: { userUuid } }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['user-posix-identities', userUuid],
    queryFn: () =>
      marketplaceOfferingUsersPosixIdentitiesList({
        query: { user_uuid: userUuid },
      }).then((response) => response.data),
    staleTime: 60 * 1000,
  });

  return (
    <ModalDialog
      title={translate('POSIX identities')}
      footer={
        <CloseDialogButton label={translate('Close')} className="w-150px" />
      }
    >
      <p className="text-secondary fs-7 mb-2">
        {translate(
          'All POSIX identifiers across the offering accounts. A UID is allocated once per pool, so the accounts on every offering of a provider that has no override pool share one row.',
        )}
      </p>
      {isLoading ? <LoadingSpinner /> : <IdentitiesTable rows={data ?? []} />}
    </ModalDialog>
  );
};
