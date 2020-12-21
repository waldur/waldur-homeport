import { FunctionComponent } from 'react';
import { ButtonGroup } from 'react-bootstrap';

import { formatDate } from '@waldur/core/dateUtils';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';

import { ApplicationDeleteButton } from './ApplicationDeleteButton';
import { ApplicationDetailsButton } from './ApplicationDetailsButton';

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
          title: translate('Project'),
          render: ({ row }) => <>{row.project_name}</>,
        },
        {
          title: translate('Catalog'),
          render: ({ row }) => <>{row.catalog_name}</>,
        },
        {
          title: translate('Template'),
          render: ({ row }) => <>{row.template_name}</>,
        },
        {
          title: translate('Created'),
          render: ({ row }) => <>{formatDate(row.created)}</>,
        },
        {
          title: translate('State'),
          render: ({ row }) => <>{row.runtime_state}</>,
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
  mapPropsToFilter: (props) => ({
    cluster_uuid: props.resource.uuid,
  }),
};

export const ClusterApplicationsList = connectTable(TableOptions)(
  TableComponent,
);
