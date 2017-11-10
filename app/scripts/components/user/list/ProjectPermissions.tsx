import * as React from 'react';

import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { filterByUser } from '@waldur/table-react/selectors';
import ProjectLink from './ProjectLink';

const TableComponent = props => {
  const { translate } = props;
  return <Table {...props} columns={[
    {
      title: translate('Project name'),
      render: ProjectLink,
    },
    {
      title: translate('Organization'),
      render: ({ row }) => <span>{row.customer_name}</span>,
    },
    {
      title: translate('Role'),
      render: ({ row }) => <span>{translate(row.role)}</span>,
    },
  ]}
  verboseName={translate('projects')}/>;
};

const TableOptions = {
  table: 'projects',
  fetchData: createFetcher('project-permissions'),
  getDefaultFilter: filterByUser,
  exportFields: ['customer', 'is_owner'],
  exportRow: row => [row.customer_name, row.role === 'owner'],
};

export default connectTable(TableOptions)(TableComponent);
