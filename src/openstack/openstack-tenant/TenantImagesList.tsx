import { FunctionComponent, ReactElement } from 'react';
import {
  OpenStackImage,
  openstackImagesList,
  OpenstackImagesListData,
} from 'waldur-js-client';

import { formatFilesize } from '@/core/utils';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

export const TenantImagesList: FunctionComponent<{
  filter: OpenstackImagesListData['query'];
  filters?: ReactElement | null;
}> = ({ filter, filters }) => {
  const props = useTable({
    table: 'openstack-images',
    fetchData: createFetcher(openstackImagesList),
    filter,
    queryField: 'name',
  });
  return (
    <Table<OpenStackImage>
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
          title: translate('Minimal RAM'),
          render: ({ row }) => formatFilesize(row.min_ram),
          id: 'min_ram',
          keys: ['min_ram'],
        },
        {
          title: translate('Minimal disk'),
          render: ({ row }) => formatFilesize(row.min_disk),
          id: 'min_disk',
          keys: ['min_disk'],
        },
        {
          title: translate('Backend ID'),
          render: ({ row }) => <>{row.backend_id || DASH_ESCAPE_CODE}</>,
          id: 'backend_id',
          optional: true,
          copyField: (row) => row.backend_id,
          keys: ['backend_id'],
        },
        {
          title: translate('UUID'),
          render: ({ row }) => <>{row.uuid}</>,
          id: 'uuid',
          optional: true,
          copyField: (row) => row.uuid,
          keys: ['uuid'],
        },
      ]}
      verboseName={translate('Images')}
      title={translate('Images')}
      hasQuery={true}
      hasOptionalColumns
      showPageSizeSelector
      filters={filters}
    />
  );
};
