import { FunctionComponent } from 'react';

import { Table, connectTable, createFetcher } from '@waldur/table';

import { ProjectExpandableRow } from './ProjectExpandableRow';

const TableComponent: FunctionComponent<any> = (props) => {
  const { translate } = props;
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
        },
        {
          title: translate('Description'),
          render: ({ row }) => <>{row.description}</>,
        },
        {
          title: translate('State'),
          render: ({ row }) => <>{row.runtime_state}</>,
        },
      ]}
      verboseName={translate('projects')}
      expandableRow={ProjectExpandableRow}
    />
  );
};

const TableOptions = {
  table: 'rancher-projects',
  fetchData: createFetcher('rancher-projects'),
  exportFields: ['name', 'description', 'state'],
  exportRow: (row) => [row.name, row.description, row.runtime_state],
  mapPropsToFilter: (props) => ({
    cluster_uuid: props.resource.uuid,
  }),
};

export const ClusterProjectList = connectTable(TableOptions)(TableComponent);
