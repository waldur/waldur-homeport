import { FunctionComponent, useMemo } from 'react';
import { RancherCluster, rancherUsersList } from 'waldur-js-client';

import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { TableWithPortal } from '@/table/types';
import { useTable } from '@/table/useTable';

import { RolesRenderer } from './RolesRenderer';

export const ClusterUsersList: FunctionComponent<
  TableWithPortal<{ resourceScope: RancherCluster }>
> = ({ resourceScope, portal }) => {
  const filter = useMemo(
    () => ({
      cluster_uuid: resourceScope.uuid,
    }),
    [resourceScope],
  );
  const props = useTable({
    table: 'rancher-cluster-users',
    fetchData: createFetcher(rancherUsersList),
    filter,
    queryField: 'user_username',
  });

  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Full name'),
          render: ({ row }) => <>{row.full_name}</>,
          export: 'full_name',
        },
        {
          title: translate('Username'),
          render: ({ row }) => <>{row.user_name}</>,
          export: 'user_name',
        },
        {
          title: translate('Cluster roles'),
          render: ({ row }) => (
            <>
              {row.cluster_roles.length ? (
                <RolesRenderer roles={row.cluster_roles} />
              ) : (
                DASH_ESCAPE_CODE
              )}
            </>
          ),

          export: false,
        },
        {
          title: translate('Project roles'),
          render: ({ row }) => (
            <>
              {row.project_roles.length ? (
                <RolesRenderer roles={row.project_roles} />
              ) : (
                DASH_ESCAPE_CODE
              )}
            </>
          ),

          export: false,
        },
        {
          title: translate('Is active'),
          render: ({ row }) => (
            <>{row.is_active ? translate('Yes') : translate('No')}</>
          ),

          export: false,
        },
      ]}
      verboseName={translate('users')}
      hasQuery={true}
      showPageSizeSelector
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
    />
  );
};
