import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { Table, connectTable, createFetcher } from '@waldur/table';

import { ProjectUpdateRequestActions } from './ProjectUpdateRequestActions';
import { ProjectUpdateRequestExpandable } from './ProjectUpdateRequestExpandable';

export const TableComponent: FunctionComponent<any> = (props) => {
  useTitle(translate('Project update requests'));
  return (
    <Table
      {...props}
      columns={[
        { title: translate('Project'), render: ({ row }) => row.old_name },
        { title: translate('State'), render: ({ row }) => row.state },
        {
          title: translate('Created'),
          render: ({ row }) => formatDateTime(row.created),
          orderField: 'created',
        },
        {
          title: translate('Reviewed at'),
          render: ({ row }) =>
            row.reviewed_at ? formatDateTime(row.reviewed_at) : 'N/A',
        },
        {
          title: translate('Reviewed by'),
          render: ({ row }) => row.reviewed_by_full_name || 'N/A',
        },
        {
          title: translate('Actions'),
          render: ({ row }) => (
            <ProjectUpdateRequestActions
              request={row}
              refreshList={props.fetch}
            />
          ),
        },
      ]}
      expandableRow={ProjectUpdateRequestExpandable}
      verboseName={translate('requests')}
    />
  );
};

const TableOptions = {
  table: 'marketplace-project-update-requests',
  fetchData: createFetcher('marketplace-project-update-requests'),
};

export const ProjectUpdateRequestsList =
  connectTable(TableOptions)(TableComponent);
