import { FunctionComponent } from 'react';

import { SymbolsGroup } from '@waldur/customer/dashboard/SymbolsGroup';
import { EstimatedCostField } from '@waldur/customer/list/EstimatedCostField';
import { translate } from '@waldur/i18n';
import { connectTable, Table } from '@waldur/table';

import { CustomerResourcesListPlaceholder } from '../resources/list/CustomerResourcesListPlaceholder';

import { fetchProviderCustomers } from './api';
import { CustomerContactColumn } from './CustomerContactColumn';

const CustomerNameColumn = ({ row }) => (
  <>
    <b>{row.name}</b>
    {row.abbreviation && row.abbreviation !== row.name ? (
      <p className="text-muted">{row.abbreviation.toLocaleUpperCase()}</p>
    ) : null}
  </>
);

const CustomerMembersColumn = ({ row }) =>
  row.users_count === 0 ? (
    translate('No active members')
  ) : (
    <SymbolsGroup items={row.users} />
  );

const CustomerProjectsColumn = ({ row }) =>
  row.projects_count === 0
    ? translate('No active projects')
    : row.projects_count === 1
    ? translate('One project')
    : translate('{count} projects', { count: row.projects_count });

export const TableComponent: FunctionComponent<any> = (props) => {
  const columns = [
    {
      title: translate('Name'),
      render: CustomerNameColumn,
    },
    {
      title: translate('Projects'),
      render: CustomerProjectsColumn,
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
      {...props}
      columns={columns}
      verboseName={translate('Organizations')}
      showPageSizeSelector={true}
    />
  );
};

const TableOptions = {
  table: 'marketplace-provider-organizations',
  fetchData: fetchProviderCustomers,
  mapPropsToFilter: ({ provider }) => ({ provider_uuid: provider.uuid }),
};

const ProviderOrganizationsListComponent = connectTable(TableOptions)(
  TableComponent,
) as React.ComponentType<any>;

export const ProviderOrganizationsList = ({ provider }) => {
  if (!provider) {
    return <CustomerResourcesListPlaceholder />;
  }
  return <ProviderOrganizationsListComponent provider={provider} />;
};
