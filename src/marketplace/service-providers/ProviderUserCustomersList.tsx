import { useMemo } from 'react';
import { marketplaceServiceProvidersUserCustomersList } from 'waldur-js-client';

import { EstimatedCostField } from '@/customer/list/EstimatedCostField';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { CustomerContactColumn } from './CustomerContactColumn';
import { CustomerMembersColumn } from './CustomerMembersColumn';
import { CustomerNameColumn } from './CustomerNameColumn';
import { ProjectsCountColumn } from './ProjectsCountColumn';

export const ProviderUserCustomersList = ({ user, provider }) => {
  const tableOptions = useMemo(
    () => ({
      table: 'marketplace-provider-user-organizations',
      fetchData: createFetcher(marketplaceServiceProvidersUserCustomersList, {
        path: { service_provider_uuid: provider.uuid },
      }),
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
      copyField: (row) => row.name,
    },
    {
      title: translate('Abbreviation'),
      render: ({ row }) => <>{renderFieldOrDash(row.abbreviation)}</>,
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
      // Ellipsis clips the first avatar: symbol-group children have a
      // negative left margin, which td.ellipsis's overflow-x hides.
      ellipsis: false,
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
