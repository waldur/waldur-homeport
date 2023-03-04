import { useMemo } from 'react';

import { EstimatedCostField } from '@waldur/customer/list/EstimatedCostField';
import { translate } from '@waldur/i18n';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { CustomerContactColumn } from './CustomerContactColumn';
import { CustomerMembersColumn } from './CustomerMembersColumn';
import { CustomerNameColumn } from './CustomerNameColumn';
import { ProjectsCountColumn } from './ProjectsCountColumn';

export const ProviderUserCustomersList = ({ user, provider }) => {
  const tableOptions = useMemo(
    () => ({
      table: 'marketplace-provider-user-organizations',
      fetchData: createFetcher(
        `marketplace-service-providers/${provider.uuid}/user_customers`,
      ),
      filter: {
        user_uuid: user.uuid,
      },
    }),
    [user, provider],
  );
  const tableProps = useTable(tableOptions);
  const columns = [
    {
      title: translate('Name'),
      render: CustomerNameColumn,
    },
    {
      title: translate('Projects'),
      render: ProjectsCountColumn,
    },
    {
      title: translate('Contact'),
      render: CustomerContactColumn,
    },
    {
      title: translate('Members'),
      render: CustomerMembersColumn,
    },
    {
      title: translate('Estimated cost'),
      render: EstimatedCostField,
    },
  ];

  return (
    <Table
      {...tableProps}
      columns={columns}
      verboseName={translate('Organizations')}
      hasActionBar={false}
    />
  );
};
