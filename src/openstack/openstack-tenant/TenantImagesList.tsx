import { FunctionComponent, useMemo } from 'react';
import { OpenStackImage, OpenstackImagesListData } from 'waldur-js-client';

import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

export const TenantImagesList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    (): OpenstackImagesListData['query'] => ({
      tenant_uuid: resourceScope.uuid,
    }),
    [resourceScope],
  );
  const props = useTable({
    table: 'openstack-images',
    fetchData: createFetcher('openstack-images'),
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
      verboseName={translate('images')}
      title={translate('Images')}
      hasQuery={true}
      hasOptionalColumns
      showPageSizeSelector
    />
  );
};
