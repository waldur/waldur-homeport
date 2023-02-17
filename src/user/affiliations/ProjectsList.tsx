import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { CustomerLink } from '@waldur/customer/CustomerLink';
import { translate } from '@waldur/i18n';
import { PROJECTS_LIST } from '@waldur/project/constants';
import { ProjectLink } from '@waldur/project/ProjectLink';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { TableOptionsType } from '@waldur/table/types';
import { getProject } from '@waldur/workspace/selectors';

import { ProjectExpandableRow } from './ProjectExpandableRow';
import { ProjectHoverableRow } from './ProjectHoverableRow';
import { ProjectsListFilter } from './ProjectsListFilter';
import { RoleField } from './RoleField';

export const TableComponent: FunctionComponent<any> = (props) => {
  const { filterColumns } = props;

  const columns = filterColumns([
    {
      title: translate('Name'),
      render: ProjectLink,
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
      render: ({ row }) => <>{row.resources_count || 0}</>,
    },
    {
      title: translate('End date'),
      render: ({ row }) =>
        row.end_date ? formatDate(row.end_date) : DASH_ESCAPE_CODE,
    },
    {
      title: translate('Created'),
      render: ({ row }) =>
        row.created ? formatDate(row.created) : DASH_ESCAPE_CODE,
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
        props.currentProject?.uuid === row.uuid ? 'bg-gray-200' : ''
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
    fetchData: createFetcher('projects'),
    queryField: 'name',
    mapPropsToFilter: (props) => {
      const filter: Record<string, string[]> = {};
      if (props.stateFilter && props.stateFilter.organization) {
        filter.customer = props.stateFilter.organization.uuid;
      }
      return filter;
    },
    exportRow: (row) => [
      row.name,
      row.customer_name,
      row.resources_count || 0,
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
  currentProject: getProject(state),
});

const Projects = connect(mapStateToProps)(PureProjects);

export const ProjectsList = (props) => {
  return <Projects filters={<ProjectsListFilter />} {...props} />;
};
