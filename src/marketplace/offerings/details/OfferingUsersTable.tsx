import { FunctionComponent, useMemo } from 'react';
import { marketplaceOfferingUsersList } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { OfferingUsersExpandableRow } from '@waldur/marketplace/service-providers/offering-users/OfferingUsersExpandableRow';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

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
    fetchData: createFetcher(marketplaceOfferingUsersList),
    filter,
  });
  const columns = [
    {
      title: translate('Name'),
      render: ({ row }) => renderFieldOrDash(row.user_full_name),
      copyField: (row) => row.user_full_name,
    },
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
      title: translate('Username'),
      render: ({ row }) => renderFieldOrDash(row.username),
      copyField: (row) => row.username,
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
        offering.plugin_options?.service_provider_can_create_offering_user && (
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
      expandableRow={OfferingUsersExpandableRow}
    />
  );
};
