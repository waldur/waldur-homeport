import { FunctionComponent } from 'react';
import { RancherApplication, RancherCluster } from 'waldur-js-client';

import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { TableWithPortal } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { ClusterFilter, useClusterResourceFilter } from '../ClusterFilter';

import { ApplicationDeleteButton } from './ApplicationDeleteButton';
import { ApplicationDetailsButton } from './ApplicationDetailsButton';

const ApplicationActions = ({ row }) => (
  <ActionsDropdownComponent>
    <ApplicationDetailsButton application={row} />
    <ApplicationDeleteButton application={row} />
  </ActionsDropdownComponent>
);

export const ClusterApplicationsList: FunctionComponent<
  TableWithPortal<{ resourceScope: RancherCluster }>
> = ({ resourceScope, portal }) => {
  const filter = useClusterResourceFilter(resourceScope);

  const props = useTable({
    table: 'rancher-apps',
    fetchData: createFetcher('rancher-apps'),
    filter,
  });

  return (
    <Table<RancherApplication>
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          copyField: (row) => row.name,
        },
        {
          title: translate('Project'),
          render: ({ row }) => <>{row.rancher_project_name}</>,
          filter: 'rancher_project',
        },
        {
          title: translate('Catalog'),
          render: ({ row }) => <>{row.catalog_name}</>,
        },
        {
          title: translate('Template'),
          render: ({ row }) => <>{row.template_name}</>,
        },
        {
          title: translate('Created'),
          render: ({ row }) => <>{formatDate(row.created)}</>,
        },
        {
          title: translate('State'),
          render: ({ row }) => <>{row.runtime_state}</>,
        },
      ]}
      rowActions={ApplicationActions}
      verboseName={translate('applications')}
      filters={<ClusterFilter cluster={resourceScope} />}
      showPageSizeSelector
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
    />
  );
};
