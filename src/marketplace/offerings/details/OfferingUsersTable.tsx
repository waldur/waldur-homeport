import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';

import { CreateOfferingUserButton } from './CreateOfferingUserButton';

export const TableComponent: FunctionComponent<any> = (props) => {
  const columns = [
    {
      title: translate('Name'),
      render: ({ row }) => (
        <Link state="users.details" params={{ uuid: row.user_uuid }}>
          {row.username || row.user_uuid}
        </Link>
      ),
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
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
      actions={
        props.offering.secret_options
          .service_provider_can_create_offering_user && (
          <CreateOfferingUserButton
            offering={props.offering}
            onSuccess={props.fetch}
          />
        )
      }
    />
  );
};

export const TableOptions: TableOptionsType = {
  table: 'OfferingUsersList',
  fetchData: createFetcher('marketplace-offering-users'),
  mapPropsToFilter: (props) => ({
    offering_uuid: props.offering.uuid,
  }),
};

const enhance = connectTable(TableOptions);

export const OfferingUsersTable = enhance(TableComponent);
