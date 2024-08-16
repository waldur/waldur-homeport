import { FunctionComponent, useMemo } from 'react';

import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

export const TenantImagesList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    () => ({
      settings_uuid: resourceScope.child_settings,
    }),
    [resourceScope],
  );
  const props = useTable({
    table: 'openstacktenant-images',
    fetchData: createFetcher('openstacktenant-images'),
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
          title: translate('Minimal RAM'),
          render: ({ row }) => formatFilesize(row.min_ram),
        },
        {
          title: translate('Minimal disk'),
          render: ({ row }) => formatFilesize(row.min_disk),
        },
      ]}
      verboseName={translate('images')}
      hasQuery={true}
    />
  );
};
