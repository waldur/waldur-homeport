import * as React from 'react';

import { Table, connectTable, createFetcher } from '@waldur/table-react';

import { ProjectExpandableRow } from './ProjectExpandableRow';

const TableComponent = props => {
  const { translate } = props;
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <span>{row.name}</span>,
        },
        {
          title: translate('Description'),
          render: ({ row }) => <span>{row.description}</span>,
        },
        {
          title: translate('State'),
          render: ({ row }) => <span>{row.runtime_state}</span>,
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
  exportRow: row => [row.name, row.description, row.runtime_state],
  mapPropsToFilter: props => ({
    cluster_uuid: props.resource.uuid,
  }),
};

export const ClusterProjectList = connectTable(TableOptions)(TableComponent);
