import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { CustomerLink } from '@waldur/customer/CustomerLink';
import { translate } from '@waldur/i18n';
import { PROJECTS_LIST } from '@waldur/project/constants';
import { ProjectAffiliationLink } from '@waldur/project/ProjectAffiliationLink';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { TableOptionsType } from '@waldur/table/types';
import { getProject, getUser } from '@waldur/workspace/selectors';

import { ProjectExpandableRow } from './ProjectExpandableRow';
import { ProjectHoverableRow } from './ProjectHoverableRow';
import { ProjectsListFilter } from './ProjectsListFilter';
import { RoleField } from './RoleField';

export const TableComponent: FunctionComponent<any> = (props) => {
  const { filterColumns } = props;

  const columns = filterColumns([
    {
      title: translate('Name'),
      render: ProjectAffiliationLink,
    },
    {
      title: translate('Organization'),
      render: ({ row }) =>
        row.customer_uuid ? (
          <CustomerLink row={row} />
        ) : (
          <>{row.customer_name}</>
        ),
    },
    {
      title: translate('Role'),
      render: RoleField,
    },
    {
      title: translate('Resources'),
      render: ({ row }) => <>{row.project_resources_count || 0}</>,
    },
    {
      title: translate('End date'),
      render: ({ row }) =>
        row.project_end_date
          ? formatDate(row.project_end_date)
          : DASH_ESCAPE_CODE,
    },
    {
      title: translate('Created'),
      render: ({ row }) =>
        row.created ? formatDate(row.project_created) : DASH_ESCAPE_CODE,
    },
  ]);

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('projects')}
      title={translate('Projects')}
      hasQuery={true}
      showPageSizeSelector={true}
      enableExport={true}
      rowClass={({ row }) =>
        props.currentProject?.uuid === row.project_uuid ? 'bg-gray-200' : ''
      }
      hoverableRow={ProjectHoverableRow}
      expandableRow={ProjectExpandableRow}
      fullWidth={true}
    />
  );
};

export const getUserProjectsList = (
  extraOptions?: Partial<TableOptionsType>,
) => {
  const TableOptions = {
    table: PROJECTS_LIST,
    fetchData: createFetcher('project-permissions'),
    queryField: 'project_name',
    mapPropsToFilter: (props) => {
      const filter: Record<string, string[]> = {};
      if (props.stateFilter && props.stateFilter.organization) {
        filter.customer = props.stateFilter.organization.uuid;
      }
      // select required fields
      filter.field = [
        'project_uuid',
        'project_name',
        'project_resources_count',
        'role',
        'customer_uuid',
        'customer_name',
        'expiration_time',
        'created',
      ];
      filter.user = props.user.uuid;
      return filter;
    },
    exportRow: (row) => [
      row.project_name,
      row.customer_name,
      row.project_resources_count || 0,
      row.expiration_time
        ? formatDateTime(row.expiration_time)
        : DASH_ESCAPE_CODE,
      formatDateTime(row.created),
    ],
    exportFields: [
      'Project',
      'Organization',
      'Resources',
      'End date',
      'Created',
    ],
    ...extraOptions,
  };

  return connectTable(TableOptions)(TableComponent);
};

const PureProjects = getUserProjectsList();

const mapStateToProps = (state: RootState) => ({
  stateFilter: getFormValues('affiliationProjectsListFilter')(state),
  user: getUser(state),
  currentProject: getProject(state),
});

const Projects = connect(mapStateToProps)(PureProjects);

export const ProjectsList = (props) => {
  return <Projects filters={<ProjectsListFilter />} {...props} />;
};
