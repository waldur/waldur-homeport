import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { CUSTOMER_OWNER_ROLE } from '@waldur/core/constants';
import { translate } from '@waldur/i18n';
import { ProjectAffiliationLink } from '@waldur/project/ProjectAffiliationLink';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { filterByUser } from '@waldur/workspace/selectors';

const TableComponent: FunctionComponent<any> = (props) => {
  return (
    <Table
      {...props}
      title={translate('Projects')}
      columns={[
        {
          title: translate('Project name'),
          render: ProjectAffiliationLink,
        },
        {
          title: translate('Organization'),
          render: ({ row }) => <>{row.customer_name}</>,
        },
        {
          title: translate('Role'),
          render: ({ row }) => (
            <>
              {ENV.roles[row.role] ? translate(ENV.roles[row.role]) : row.role}
            </>
          ),
        },
      ]}
      verboseName={translate('projects')}
    />
  );
};

const TableOptions = {
  table: 'projects',
  fetchData: createFetcher('project-permissions'),
  getDefaultFilter: filterByUser,
  exportFields: ['customer', 'is_owner'],
  exportRow: (row) => [row.customer_name, row.role === CUSTOMER_OWNER_ROLE],
};

export const ProjectPermissions = connectTable(TableOptions)(TableComponent);
