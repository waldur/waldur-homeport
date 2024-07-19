import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { getProject } from '@waldur/workspace/selectors';

import { ProjectUpdateRequestExpandable } from './ProjectUpdateRequestExpandable';
import { ProjectUpdateRequestListFilter } from './ProjectUpdateRequestListFilter';

const mapStateToFilter = createSelector(
  getProject,
  getFormValues('ProjectUpdateRequestListFilter'),
  (project, filterValues: any) => ({
    project_uuid: project.uuid,
    state: filterValues?.state?.map((choice) => choice.value),
  }),
);

export const ProjectUpdateRequestsList: FunctionComponent = () => {
  useTitle(translate('Project updates'));
  const filter = useSelector(mapStateToFilter);
  const props = useTable({
    table: 'marketplace-project-update-requests',
    fetchData: createFetcher('marketplace-project-update-requests'),
    filter,
  });
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Offering'),
          render: ({ row }) => row.offering_name,
        },
        {
          title: translate('State'),
          render: ({ row }) => row.state,
          filter: 'state',
        },
        {
          title: translate('Created'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
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
      ]}
      expandableRow={ProjectUpdateRequestExpandable}
      verboseName={translate('requests')}
      filters={<ProjectUpdateRequestListFilter />}
    />
  );
};
