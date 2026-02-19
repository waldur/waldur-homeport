import { useSelector } from 'react-redux';
import {
  Project,
  projectsListUsersList,
  UserRoleDetails,
} from 'waldur-js-client';

import { TeamTableComponent } from '@waldur/customer/team/TeamTableComponent';
import { getProjectRoles } from '@waldur/permissions/utils';
import { createFetcher } from '@waldur/table/api';
import {
  ProjectsListUsersFilter,
  selectProjectsListUsersFilter,
} from '@waldur/table/generated/ProjectsListUsersFilter';
import { useTable } from '@waldur/table/useTable';
import { getProject } from '@waldur/workspace/selectors';

import { ProjectPermisionActions } from './ProjectPermisionActions';
import { ProjectPermissionsLogButton } from './ProjectPermissionsLogButton';
import { ProjectUsersBulkRemoveButton } from './ProjectUsersBulkRemoveButton';
import { SyncMembersButton } from './SyncMembersButton';
import { useTeamTableTabs } from './tabs';
import { TeamDropdownActions } from './TeamDropdownActions';
import { useRedirectCourseProjects } from './utils';

const mandatoryFields = [
  // Required for actions
  'user_uuid',
  'user_email',
  'expiration_time',
  'user_full_name',
  'role_name',
  'user_username',
];

const TeamSecondaryDropdownActions = ({ project, refetch }) => {
  // For removed projects, only show permissions log (read-only)
  if (project?.is_removed) {
    return (
      <ProjectPermissionsLogButton projectId={project?.uuid} asDropdownItem />
    );
  }

  return (
    <>
      <SyncMembersButton project={project} refetch={refetch} />
      <ProjectPermissionsLogButton projectId={project?.uuid} asDropdownItem />
    </>
  );
};

export const ProjectUsersList = ({
  hideTabs = false,
  project,
}: {
  hideTabs?: boolean;
  project: Project;
}) => {
  const filter = useSelector(selectProjectsListUsersFilter);
  const currentProject = useSelector(getProject);

  const _project = project || currentProject;

  const tableProps = useTable({
    table: 'project-users',
    fetchData: createFetcher(projectsListUsersList, {
      path: { uuid: _project?.uuid },
    }),
    queryField: 'search_string',
    filter,
    mandatoryFields,
  });

  const tabs = useTeamTableTabs(_project);

  useRedirectCourseProjects(_project);

  return (
    <TeamTableComponent<UserRoleDetails>
      {...tableProps}
      context="project"
      userFieldPrefix="user_"
      tabs={!hideTabs && tabs}
      tableActions={
        <TeamDropdownActions project={_project} refetch={tableProps.fetch} />
      }
      dropdownActions={
        <TeamSecondaryDropdownActions
          project={_project}
          refetch={tableProps.fetch}
        />
      }
      showExportInDropdown
      rowActions={({ row, fetch }) => (
        <ProjectPermisionActions
          row={row}
          fetch={fetch}
          projectUuid={_project?.uuid}
          customerUuid={_project?.customer_uuid}
          project={_project}
        />
      )}
      filters={<ProjectsListUsersFilter projectRoles={getProjectRoles()} />}
      enableMultiSelect
      multiSelectActions={({ rows, refetch }) => (
        <ProjectUsersBulkRemoveButton
          rows={rows}
          refetch={refetch}
          project={_project}
        />
      )}
    />
  );
};
