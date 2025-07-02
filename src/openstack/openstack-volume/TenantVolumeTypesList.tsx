import { FunctionComponent, useMemo } from 'react';

import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';
export const TenantVolumeTypesList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    () => ({ tenant_uuid: resourceScope.uuid }),
    [resourceScope],
  );

  const props = useTable({
    table: 'openstack-volume-types',
    fetchData: createFetcher('openstack-volume-types'),
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
        },
        {
          title: translate('Description'),
          render: ({ row }) => renderFieldOrDash(row.description),
        },
      ]}
      hasQuery={true}
      title={translate('volume types')}
      verboseName={translate('Volume types')}
      showPageSizeSelector
    />
  );
};
