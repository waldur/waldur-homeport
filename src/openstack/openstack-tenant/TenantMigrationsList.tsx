import { FunctionComponent, useMemo } from 'react';
import {
  MigrationDetails,
  OpenstackMigrationsListData,
} from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { MigrationRowActions } from './actions/MigrationRowActions';
import { CreateMigrationButton } from './CreateMigrationButton';
import { MigrationExpandableRow } from './MigrationExpandableRow';

export const TenantMigrationsList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    (): OpenstackMigrationsListData['query'] => ({
      src_resource_uuid: resourceScope.marketplace_resource_uuid,
    }),
    [resourceScope],
  );
  const props = useTable({
    table: 'openstack-migrations',
    fetchData: createFetcher('openstack-migrations'),
    filter,
  });
  return (
    <Table<MigrationDetails>
      {...props}
      columns={[
        {
          title: translate('Destination resource'),
          render: ({ row }) => (
            <ResourceLink
              uuid={row.dst_resource_uuid}
              label={row.dst_resource_name}
            />
          ),
        },
        {
          title: translate('Destination offering'),
          render: ({ row }) => row.dst_offering_name,
        },
        {
          title: translate('Created'),
          render: ({ row }) => formatDateTime(row.created),
        },
        {
          title: translate('Replication state'),
          render: ({ row }) => row.state,
        },
        {
          title: translate('Destination resource state'),
          render: ({ row }) => row.dst_resource_state,
        },
      ]}
      verboseName={translate('replications')}
      rowActions={({ row }) => (
        <MigrationRowActions row={row} refetch={props.fetch} />
      )}
      tableActions={
        <CreateMigrationButton resource={resourceScope} refetch={props.fetch} />
      }
      expandableRow={MigrationExpandableRow}
    />
  );
};
