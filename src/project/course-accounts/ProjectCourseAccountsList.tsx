import { useMemo } from 'react';
import { CourseAccount, marketplaceCourseAccountsList } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { TeamDropdownActions } from '@/project/team/TeamDropdownActions';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { useProject } from '@/workspace/hooks';

import { ProjectLink } from '../ProjectLink';
import { ProjectPermissionsLogButton } from '../team/ProjectPermissionsLogButton';
import { useTeamTableTabs } from '../team/tabs';

import { CourseAccountActions } from './CourseAccountActions';
import { CourseAccountExpandableRow } from './CourseAccountExpandableRow';

const courseAccountState = {
  Pending: { label: translate('Pending'), color: 'warning' },
  Closed: { label: translate('Closed'), color: 'default' },
  Erred: { label: translate('Erred'), color: 'danger' },
  OK: { label: translate('OK'), color: 'success' },
};

export const ProjectCourseAccountsList = ({ admin = false }) => {
  const project = useProject();

  const filter = useMemo(
    () => (admin ? undefined : { project_uuid: project.uuid }),
    [project, admin],
  );
  const tableProps = useTable({
    table: `marketplace-project-course-accounts`,
    fetchData: createFetcher(marketplaceCourseAccountsList),
    filter,
    queryField: 'email',
  });

  const columns = useMemo<Column<CourseAccount>[]>(
    () =>
      [
        admin && {
          title: translate('Project'),
          render: ({ row }) => (
            <ProjectLink
              row={{ uuid: row.project_uuid, name: row.project_name }}
            />
          ),
          export: 'project_name',
        },
        {
          title: translate('Username'),
          render: ({ row }) => row.username,
          export: 'username',
        },
        {
          title: translate('Email'),
          render: ({ row }) => (
            <div className="d-flex align-items-center gap-1">
              {row.email}
              <CopyToClipboardButton value={row.email} />
            </div>
          ),
          export: 'email',
        },
        {
          title: translate('Creation date'),
          orderField: 'created',
          render: ({ row }) => formatDate(row.created),
          export: (row) => formatDate(row.created),
        },
        {
          title: translate('State'),
          render: ({ row }) => (
            <Badge variant={courseAccountState[row.state].color} pill outline>
              {courseAccountState[row.state].label}
            </Badge>
          ),
        },
      ].filter(Boolean) as Column<CourseAccount>[],
    [],
  );

  const tabs = useTeamTableTabs(project);

  return (
    <Table<CourseAccount>
      {...tableProps}
      columns={columns}
      title={admin ? translate('Course accounts') : translate('Team')}
      verboseName={translate('Course accounts')}
      hasQuery
      enableExport
      tabs={admin ? undefined : tabs}
      expandableRow={CourseAccountExpandableRow}
      rowActions={
        admin
          ? undefined
          : ({ row }) => (
              <CourseAccountActions row={row} refetch={tableProps.fetch} />
            )
      }
      tableActions={
        admin ? undefined : (
          <TeamDropdownActions refetch={tableProps.fetch} project={project} />
        )
      }
      dropdownActions={
        admin ? undefined : <ProjectPermissionsLogButton asDropdownItem />
      }
      showExportInDropdown={!admin}
    />
  );
};
