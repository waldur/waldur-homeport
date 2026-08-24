import { FC, useMemo } from 'react';
import { Badge } from 'react-bootstrap';
import {
  marketplacePosixIdentitiesList,
  PosixIdentity,
  PosixIdPool,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { createFetcher } from '@/table/api';
import {
  MarketplacePosixIdentitiesFilter,
  PosixIdentityConsumerTypeOptions,
  selectMarketplacePosixIdentitiesFilter,
} from '@/table/generated/MarketplacePosixIdentitiesFilter';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

interface PosixIdPoolIdentitiesDialogProps {
  resolve: { pool: PosixIdPool };
}

// One source of truth for the principal kinds: the same generated options the
// filter offers are used to label the column.
const getConsumerTypeLabel = (consumerType: string) =>
  PosixIdentityConsumerTypeOptions.find(
    (option) => option.value === consumerType,
  )?.label;

export const PosixIdPoolIdentitiesDialog: FC<
  PosixIdPoolIdentitiesDialogProps
> = ({ resolve: { pool } }) => {
  const tableKey = 'posix-id-pool-identities-' + pool.uuid;
  const values = useFilterValues(tableKey);

  const filter = useMemo(
    () => ({
      pool_uuid: pool.uuid,
      ...selectMarketplacePosixIdentitiesFilter(values),
    }),
    [pool.uuid, values],
  );
  // A pool covers a whole numeric range, so the list is paginated and narrowed
  // server-side: filtering the page the client happens to hold would report
  // "not found" for a value that exists further down the range.
  const tableProps = useTable({
    table: tableKey,
    fetchData: createFetcher(marketplacePosixIdentitiesList),
    filter,
    queryField: 'keyword',
  });

  const columns = useMemo(
    () => [
      {
        title: translate('UID'),
        render: ({ row }: { row: PosixIdentity }) => renderFieldOrDash(row.uid),
        copyField: (row: PosixIdentity) => String(row.uid ?? ''),
        orderField: 'uid',
      },
      {
        title: translate('GID'),
        render: ({ row }: { row: PosixIdentity }) => renderFieldOrDash(row.gid),
        copyField: (row: PosixIdentity) => String(row.gid ?? ''),
        orderField: 'gid',
      },
      {
        title: translate('Account'),
        render: ({ row }: { row: PosixIdentity }) =>
          renderFieldOrDash(row.consumer_name),
      },
      {
        title: translate('Type'),
        render: ({ row }: { row: PosixIdentity }) => (
          <>
            {getConsumerTypeLabel(row.consumer_type) ??
              renderFieldOrDash(row.consumer_type)}
          </>
        ),
      },
      {
        title: translate('Offering'),
        render: ({ row }: { row: PosixIdentity }) =>
          renderFieldOrDash(row.offering_name),
      },
      {
        title: translate('Issued'),
        render: ({ row }: { row: PosixIdentity }) => (
          <>{formatDateTime(row.created)}</>
        ),
        orderField: 'created',
      },
      {
        title: translate('Released'),
        render: ({ row }: { row: PosixIdentity }) =>
          row.released_at ? (
            <>{formatDateTime(row.released_at)}</>
          ) : (
            <>{renderFieldOrDash(null)}</>
          ),
        orderField: 'released_at',
      },
      {
        title: translate('Status'),
        render: ({ row }: { row: PosixIdentity }) =>
          !row.released_at ? (
            <Badge bg="light-success" text="success">
              {translate('Active')}
            </Badge>
          ) : row.recyclable === false ? (
            // Released, but withheld from the pool: the number is still stamped
            // on files in the provider's filesystem until an operator returns it.
            <Badge bg="light-danger" text="danger">
              {translate('Withheld')}
            </Badge>
          ) : (
            <Badge bg="light-warning" text="warning">
              {translate('Released')}
            </Badge>
          ),
      },
    ],
    [],
  );

  return (
    <ModalDialog title={translate('POSIX identities')}>
      <div className="size-xl">
        <Table<PosixIdentity>
          {...tableProps}
          columns={columns}
          verboseName={translate('POSIX identities')}
          initialSorting={{ field: 'uid', mode: 'asc' }}
          hasQuery={true}
          placeholderComponent={
            <p className="text-secondary mb-0">
              {translate('No identifiers have been issued from this pool yet.')}
            </p>
          }
          showPageSizeSelector={true}
          filters={<MarketplacePosixIdentitiesFilter />}
          hideTitle
        />
      </div>
    </ModalDialog>
  );
};
