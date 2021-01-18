import { FunctionComponent } from 'react';

import { ResourceRowActions } from '@waldur/resource/actions/ResourceRowActions';
import { ResourceName } from '@waldur/resource/ResourceName';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { Table, connectTable, createFetcher } from '@waldur/table';

import { CreateDatabaseAction } from './CreateDatabaseAction';

const TableComponent: FunctionComponent<any> = (props) => {
  const { translate } = props;
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <ResourceName resource={row} />,
        },
        {
          title: translate('Charset'),
          render: ({ row }) => row.charset || 'N/A',
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
        {
          title: translate('Actions'),
          render: ({ row }) => <ResourceRowActions resource={row} />,
        },
      ]}
      verboseName={translate('databases')}
      actions={<CreateDatabaseAction resource={props.resource} />}
    />
  );
};

const TableOptions = {
  table: 'azure-sql-databases',
  fetchData: createFetcher('azure-sql-databases'),
  mapPropsToFilter: (props) => ({
    server_uuid: props.resource.uuid,
  }),
};

export const DatabasesList = connectTable(TableOptions)(TableComponent);
