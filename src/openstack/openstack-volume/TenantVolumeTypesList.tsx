import { FunctionComponent } from 'react';
import { openstackVolumeTypesList } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

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
