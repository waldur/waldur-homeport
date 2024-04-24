import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { PROJECTS_LIST } from '@waldur/project/constants';
import { ProjectLink } from '@waldur/project/ProjectLink';
import { Table, createFetcher } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { useTable } from '@waldur/table/utils';
import { getProject } from '@waldur/workspace/selectors';

import { ProjectExpandableRow } from './ProjectExpandableRow';
import { ProjectHoverableRow } from './ProjectHoverableRow';
import { RoleField } from './RoleField';

const exportRow = (row) => [
  row.name,
  row.customer_name,
  row.resources_count || 0,
  row.expiration_time ? formatDateTime(row.expiration_time) : DASH_ESCAPE_CODE,
  formatDateTime(row.created),
];

const exportFields = [
  'Project',
  'Organization',
  'Resources',
  'End date',
  'Created',
];

export const BaseProjectsList: FunctionComponent<{ filter; filters? }> = ({
  filter,
  filters,
}) => {
  const currentProject = useSelector(getProject);
  const props = useTable({
    table: PROJECTS_LIST,
    fetchData: createFetcher('projects'),
    queryField: 'name',
    filter,
    exportRow,
    exportFields,
  });

  const columns = [
    {
      title: translate('Name'),
      render: ProjectLink,
    },
    {
      title: translate('Organization'),
      render: ({ row }) =>
        row.customer_uuid ? (
          <Link
            state="organization.dashboard"
            params={{ uuid: row.customer_uuid }}
            label={row.customer_name}
          />
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
      render: ({ row }) => (
        <>{row.end_date ? formatDate(row.end_date) : DASH_ESCAPE_CODE}</>
      ),
    },
    {
      title: translate('Created'),
      render: ({ row }) => (
        <>{row.created ? formatDate(row.created) : DASH_ESCAPE_CODE}</>
      ),
    },
  ];

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
        currentProject?.uuid === row.uuid ? 'bg-gray-200' : ''
      }
      hoverableRow={ProjectHoverableRow}
      expandableRow={ProjectExpandableRow}
      fullWidth={true}
      filters={filters}
    />
  );
};
