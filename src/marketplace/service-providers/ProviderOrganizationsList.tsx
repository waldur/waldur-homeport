import { useCallback } from 'react';

import { EstimatedCostField } from '@waldur/customer/list/EstimatedCostField';
import { translate } from '@waldur/i18n';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { CustomerResourcesListPlaceholder } from '../resources/list/CustomerResourcesListPlaceholder';

import { CustomerContactColumn } from './CustomerContactColumn';
import { CustomerMembersColumn } from './CustomerMembersColumn';
import { CustomerNameColumn } from './CustomerNameColumn';
import { OrganizationProjectsExpandable } from './OrganizationProjectsExpandable';
import { ProjectsCountColumn } from './ProjectsCountColumn';

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
      <OrganizationProjectsExpandable row={row} provider_uuid={provider.uuid} />
    ),
    [provider],
  );

  return (
    <Table
      {...tableProps}
      columns={columns}
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
