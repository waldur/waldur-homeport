import * as React from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { ResourceName } from '@waldur/resource/ResourceName';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { connectAngularComponent } from '@waldur/store/connect';
import { Table, connectTable, createFetcher } from '@waldur/table-react';

const TableComponent = props => {
  const { translate } = props;
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <ResourceName resource={row} />,
          orderField: 'name',
        },
        {
          title: translate('Type'),
          render: ({ row }) => row.template_name || 'N/A',
        },
        {
          title: translate('Provider'),
          render: ({ row }) => row.service_name,
        },
        {
          title: translate('Created'),
          render: ({ row }) => formatDateTime(row.created),
          orderField: 'created',
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
      ]}
      verboseName={translate('service desk projects')}
    />
  );
};

const mapPropsToFilter = props => ({
  project_uuid: props.resource.uuid,
});

const TableOptions = {
  table: 'jira-projects',
  fetchData: createFetcher('jira-projects'),
  mapPropsToFilter,
};

const JiraProjectsList = connectTable(TableOptions)(TableComponent);

export default connectAngularComponent(JiraProjectsList, ['resource']);
