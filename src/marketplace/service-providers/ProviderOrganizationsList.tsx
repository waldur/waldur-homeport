import { useCallback } from 'react';

import { EstimatedCostField } from '@waldur/customer/list/EstimatedCostField';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { CustomerResourcesListPlaceholder } from '../resources/list/CustomerResourcesListPlaceholder';

import { CustomerContactColumn } from './CustomerContactColumn';
import { CustomerMembersColumn } from './CustomerMembersColumn';
import { CustomerNameColumn } from './CustomerNameColumn';
import { OrganizationProjectsExpandable } from './OrganizationProjectsExpandable';
import { ProjectsCountColumn } from './ProjectsCountColumn';
import { PROVIDER_CUSTOMERS_TABLE_TABS } from './utils';

const ProviderOrganizationsListComponent = ({ provider }) => {
  const tableProps = useTable({
    table: 'marketplace-provider-organizations',
    fetchData: createFetcher(
      `marketplace-service-providers/${provider.uuid}/customers`,
    ),
  });
  const columns = [
    {
      title: translate('Name'),
      render: CustomerNameColumn,
      copyField: (row) => row.name,
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

  const ExpandableRow = useCallback(
    ({ row }) => (
      <OrganizationProjectsExpandable
        row={row}
        provider_uuid={provider.uuid}
        provider_customer_uuid={provider.customer_uuid}
      />
    ),

    [provider],
  );

  return (
    <Table
      {...tableProps}
      columns={columns}
      tabs={PROVIDER_CUSTOMERS_TABLE_TABS}
      verboseName={translate('Organizations')}
      showPageSizeSelector={true}
      expandableRow={ExpandableRow}
    />
  );
};

export const ProviderOrganizationsList = ({ provider }) => {
  if (!provider) {
    return <CustomerResourcesListPlaceholder />;
  }
  return <ProviderOrganizationsListComponent provider={provider} />;
};
