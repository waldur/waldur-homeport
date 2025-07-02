import { FunctionComponent, useMemo } from 'react';
import { OpenStackFlavor, OpenstackFlavorsListData } from 'waldur-js-client';

import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

export const TenantFlavorsList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    (): OpenstackFlavorsListData['query'] => ({
      tenant_uuid: resourceScope.uuid,
    }),
    [resourceScope],
  );

  const props = useTable({
    table: 'openstack-flavors',
    fetchData: createFetcher('openstack-flavors'),
    filter,
    queryField: 'name',
  });

  return (
    <Table<OpenStackFlavor>
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => row.name,
          copyField: (row) => row.name,
          id: 'name',
          keys: ['name'],
        },
        {
          title: translate('Cores'),
          render: ({ row }) => row.cores,
          orderField: 'cores',
          id: 'cores',
          keys: ['cores'],
        },
        {
          title: translate('RAM'),
          render: ({ row }) => formatFilesize(row.ram),
          orderField: 'ram',
          id: 'ram',
          keys: ['ram'],
        },
        {
          title: translate('Backend ID'),
          render: ({ row }) => <>{row.backend_id || DASH_ESCAPE_CODE}</>,
          id: 'backend_id',
          optional: true,
          keys: ['backend_id'],
          copyField: (row) => row.backend_id,
        },
        {
          title: translate('UUID'),
          render: ({ row }) => <>{row.uuid}</>,
          id: 'uuid',
          optional: true,
          keys: ['uuid'],
          copyField: (row) => row.uuid,
        },
      ]}
      title={translate('Flavors')}
      verboseName={translate('flavors')}
      hasQuery={true}
      hasOptionalColumns
      showPageSizeSelector
    />
  );
};
