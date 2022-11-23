import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { formatFlavor } from '@waldur/resource/utils';
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
          title: translate('Summary'),
          render: ({ row }) => formatFlavor(row),
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