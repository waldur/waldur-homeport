import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { ResourceRowActions } from '@waldur/resource/actions/ResourceRowActions';
import { ResourceName } from '@waldur/resource/ResourceName';
import { Table, connectTable, createFetcher } from '@waldur/table';

const TableComponent: FunctionComponent<any> = (props) => {
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <ResourceName resource={row} />,
        },
        {
          title: translate('Flavor'),
          render: ({ row }) => row.flavor_name || 'N/A',
        },
        {
          title: translate('Image'),
          render: ({ row }) => row.image_name,
        },
        {
          title: translate('Actions'),
          render: ({ row }) => <ResourceRowActions resource={row} />,
        },
      ]}
      verboseName={translate('instances')}
    />
  );
};

const TableOptions = {
  table: 'openstacktenant-instances',
  fetchData: createFetcher('openstacktenant-instances'),
  mapPropsToFilter: (props) => ({
    service_settings_uuid: props.resource.child_settings,
  }),
};

export const TenantInstancesList = connectTable(TableOptions)(TableComponent);
