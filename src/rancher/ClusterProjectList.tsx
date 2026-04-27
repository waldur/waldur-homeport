import { FunctionComponent, useMemo } from 'react';
import {
  RancherCluster,
  RancherProject,
  rancherProjectsList,
  RancherProjectsListData,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { TableWithPortal } from '@/table/types';
import { useTable } from '@/table/useTable';

import { ProjectExpandableRow } from './ProjectExpandableRow';

export const ClusterProjectList: FunctionComponent<
  TableWithPortal<{ resourceScope: RancherCluster }>
> = ({ resourceScope, portal }) => {
  const filter = useMemo(
    () =>
      ({
        // ManagedRancher marketplace resource scope is a Rancher marketplace resource
        // and not a Rancher cluster directly because of uniqueness constraint.
        // We need to use resource_uuid from the scope to filter security groups.
        cluster_uuid: resourceScope['resource_uuid'] || resourceScope.uuid,
      }) satisfies RancherProjectsListData['query'],
    [resourceScope],
  );
  const props = useTable({
    table: 'rancher-projects',
    fetchData: createFetcher(rancherProjectsList),
    filter,
  });

  return (
    <Table<RancherProject>
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          copyField: (row) => row.name,
          export: 'name',
        },
        {
          title: translate('Description'),
          render: ({ row }) => <>{row.description}</>,
          export: 'description',
        },
        {
          title: translate('State'),
          render: ({ row }) => <>{row.runtime_state}</>,
          export: 'runtime_state',
        },
      ]}
      verboseName={translate('projects')}
      showPageSizeSelector
      expandableRow={ProjectExpandableRow}
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
    />
  );
};
