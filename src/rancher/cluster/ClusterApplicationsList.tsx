import * as React from 'react';
import * as ButtonGroup from 'react-bootstrap/lib/ButtonGroup';

import { formatDate } from '@waldur/core/dateUtils';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { TableOptionsType } from '@waldur/table-react/types';

import { ApplicationDeleteButton } from './ApplicationDeleteButton';
import { ApplicationDetailsButton } from './ApplicationDetailsButton';

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
          title: translate('Project'),
          render: ({ row }) => <span>{row.project}</span>,
        },
        {
          title: translate('Catalog'),
          render: ({ row }) => <span>{row.catalog}</span>,
        },
        {
          title: translate('Template'),
          render: ({ row }) => <span>{row.template}</span>,
        },
        {
          title: translate('Created'),
          render: ({ row }) => <span>{formatDate(row.created)}</span>,
        },
        {
          title: translate('State'),
          render: ({ row }) => <span>{row.state}</span>,
        },
        {
          title: translate('Actions'),
          render: ({ row }) => (
            <ButtonGroup>
              <ApplicationDetailsButton application={row} />
              <ApplicationDeleteButton application={row} />
            </ButtonGroup>
          ),
        },
      ]}
      verboseName={translate('applications')}
    />
  );
};

const TableOptions: TableOptionsType = {
  table: 'rancher-apps',
  fetchData: createFetcher('rancher-apps'),
  mapPropsToFilter: props => ({
    cluster_uuid: props.resource.uuid,
  }),
};

export const ClusterApplicationsList = connectTable(TableOptions)(
  TableComponent,
);
