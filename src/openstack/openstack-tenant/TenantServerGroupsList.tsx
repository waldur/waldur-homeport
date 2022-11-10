import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { Table, connectTable, createFetcher } from '@waldur/table';

const TableComponent: FunctionComponent<any> = (props) => {
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => row.name,
        },
        {
          title: translate('Summary'),
          render: ({ row }) => translate('Policy: {policy}', row),
        },
      ]}
      verboseName={translate('server groups')}
    />
  );
};

const TableOptions = {
  table: 'openstack-server-groups',
  fetchData: createFetcher('openstack-server-groups'),
  mapPropsToFilter: (props) => ({
    tenant: props.resource.url,
  }),
};

export const TenantServerGroupsList =
  connectTable(TableOptions)(TableComponent);
