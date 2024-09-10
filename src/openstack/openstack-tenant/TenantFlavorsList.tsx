import { FunctionComponent, useMemo } from 'react';

import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

export const TenantFlavorsList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    () => ({
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
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => row.name,
          copyField: (row) => row.name,
        },
        {
          title: translate('Cores'),
          render: ({ row }) => row.cores,
          orderField: 'cores',
        },
        {
          title: translate('RAM'),
          render: ({ row }) => formatFilesize(row.ram),
          orderField: 'ram',
        },
      ]}
      verboseName={translate('flavors')}
      hasQuery={true}
    />
  );
};
