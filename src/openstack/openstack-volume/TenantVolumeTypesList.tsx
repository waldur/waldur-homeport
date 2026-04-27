import { FunctionComponent } from 'react';
import { openstackVolumeTypesList } from 'waldur-js-client';

import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

export const TenantVolumeTypesList: FunctionComponent<{ filter }> = ({
  filter,
}) => {
  const props = useTable({
    table: 'openstack-volume-types',
    fetchData: createFetcher(openstackVolumeTypesList),
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
      title={translate('Volume types')}
      verboseName={translate('Volume types')}
      showPageSizeSelector
    />
  );
};
