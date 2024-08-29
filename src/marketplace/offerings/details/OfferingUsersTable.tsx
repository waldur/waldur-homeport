import { FunctionComponent, useMemo } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { OfferingUserRowActions } from '../actions/OfferingUserRowActions';

import { CreateOfferingUserButton } from './CreateOfferingUserButton';

export const OfferingUsersTable: FunctionComponent<{ offering }> = ({
  offering,
}) => {
  const filter = useMemo(
    () => ({
      offering_uuid: offering.uuid,
    }),
    [offering],
  );
  const props = useTable({
    table: 'OfferingUsersList',
    fetchData: createFetcher('marketplace-offering-users'),
    filter,
  });
  const columns = [
    {
      title: translate('UUID'),
      render: ({ row }) => (
        <Link state="users.details" params={{ uuid: row.user_uuid }}>
          {row.user_uuid}
        </Link>
      ),
      copyField: (row) => row.user_uuid,
    },
    {
      title: translate('Name'),
      render: ({ row }) => row.username || row.user_full_name,
      copyField: (row) => row.username || row.user_full_name,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => <>{formatDateTime(row.created)}</>,
    },
  ];

  return (
    <Table
      {...props}
      title={translate('Users')}
      columns={columns}
      verboseName={translate('offering users')}
      showPageSizeSelector={true}
      initialPageSize={5}
      tableActions={
        offering.secret_options.service_provider_can_create_offering_user && (
          <CreateOfferingUserButton
            offering={offering}
            onSuccess={props.fetch}
          />
        )
      }
      rowActions={({ row }) => (
        <OfferingUserRowActions
          row={row}
          fetch={props.fetch}
          offering={offering}
        />
      )}
    />
  );
};
