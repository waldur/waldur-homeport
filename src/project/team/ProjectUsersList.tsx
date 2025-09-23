import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import { Project, UserRoleDetails } from 'waldur-js-client';

import { TeamTableComponent } from '@waldur/customer/team/TeamTableComponent';
import { createFetcher } from '@waldur/table/api';
import { useTable } from '@waldur/table/useTable';
import { getProject } from '@waldur/workspace/selectors';

import { PROJECT_USERS_LIST_FILTER_FORM_ID } from '../constants';

import { ProjectPermisionActions } from './ProjectPermisionActions';
import { ProjectPermissionsLogButton } from './ProjectPermissionsLogButton';
import { ProjectUsersBulkRemoveButton } from './ProjectUsersBulkRemoveButton';
import { ProjectUsersListFilter } from './ProjectUsersListFilter';
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
const mapStateToFilter = createSelector(
  getFormValues(PROJECT_USERS_LIST_FILTER_FORM_ID),
  (filterValues: any) => {
    const filter: Record<string, string | boolean> = {};
    if (filterValues) {
      if (filterValues.project_role) {
        filter.role = filterValues.project_role.map(({ name }) => name);
      }
    }
    return filter;
  },
);

const TeamSecondaryDropdownActions = ({ project, refetch }) => {
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
  const filter = useSelector(mapStateToFilter);
  const currentProject = useSelector(getProject);

  const _project = project || currentProject;

  const tableProps = useTable({
    table: 'project-users',
    fetchData: createFetcher(`projects/${_project?.uuid}/list_users`),
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
        />
      )}
      filters={<ProjectUsersListFilter />}
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
