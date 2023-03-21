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

const TableOptions = {
  table: 'openstacktenant-flavors',
  fetchData: createFetcher('openstacktenant-flavors'),
  mapPropsToFilter: (props) => ({
    settings_uuid: props.resource.child_settings,
  }),
  queryField: 'name',
};

export const TenantFlavorsList = connectTable(TableOptions)(TableComponent);
