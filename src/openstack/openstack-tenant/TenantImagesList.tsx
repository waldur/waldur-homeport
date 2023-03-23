import { FunctionComponent } from 'react';

import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { Table, connectTable, createFetcher } from '@waldur/table';

const TableComponent: FunctionComponent<any> = (props) => {
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => row.name,
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

const TableOptions = {
  table: 'openstacktenant-images',
  fetchData: createFetcher('openstacktenant-images'),
  mapPropsToFilter: (props) => ({
    settings_uuid: props.resource.child_settings,
  }),
  queryField: 'name',
};

export const TenantImagesList = connectTable(TableOptions)(TableComponent);
