import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import { UserRoleDetails } from 'waldur-js-client';

import Avatar from '@waldur/core/Avatar';
import { renderRoleExpirationDate } from '@waldur/customer/team/CustomerUsersList';
import { isFeatureVisible } from '@waldur/features/connect';
import { UserFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { RoleField } from '@waldur/user/affiliations/RoleField';
import { getProject } from '@waldur/workspace/selectors';

import { PROJECT_USERS_LIST_FILTER_FORM_ID } from '../constants';
import { PROJECT_TEAM_TABLE_TABS } from '../utils';

import { ProjectPermisionActions } from './ProjectPermisionActions';
import { ProjectPermissionsLogButton } from './ProjectPermissionsLogButton';
import { ProjectUsersBulkRemoveButton } from './ProjectUsersBulkRemoveButton';
import { ProjectUsersListFilter } from './ProjectUsersListFilter';
import { TeamDropdownActions } from './TeamDropdownActions';

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

export const ProjectUsersList = ({
  hideTabs = false,
  projectUuid,
  customerUuid,
}: {
  hideTabs?: boolean;
  projectUuid?: string;
  customerUuid?: string;
}) => {
  const filter = useSelector(mapStateToFilter);
  const project = useSelector(getProject);
  const tableProps = useTable({
    table: 'project-users',
    fetchData: createFetcher(
      `projects/${project?.uuid || projectUuid}/list_users`,
    ),
    queryField: 'search_string',
    filter,
    mandatoryFields,
  });

  return (
    <Table<UserRoleDetails>
      {...tableProps}
      columns={[
        {
          title: translate('Member'),
          render: ({ row }) => (
            <div className="d-flex align-items-center gap-1">
              <Avatar name={row.user_full_name} src={row.user_image} circle />
              {row.user_full_name || DASH_ESCAPE_CODE}
            </div>
          ),

          id: 'member',
          keys: ['user_full_name', 'user_username', 'user_image'],
          copyField: (row) => row.user_full_name,
        },
        {
          title: translate('Email'),
          render: ({ row }) => row.user_email || DASH_ESCAPE_CODE,
          id: 'user_email',
          keys: ['user_email'],
          copyField: (row) => row.user_email,
        },
        {
          title: translate('Username'),
          render: ({ row }) => row.user_username,
          copyField: (row) => row.user_username,
          id: 'user_username',
          keys: ['user_username'],
          optional: !isFeatureVisible(UserFeatures.show_username),
        },

        {
          title: translate('Role in project'),
          render: RoleField,
          id: 'role_name',
          keys: ['role_name'],
          filter: 'project_role',
        },
        {
          title: translate('Role expiration'),
          render: ({ row }) => renderRoleExpirationDate(row),
          id: 'expiration_time',
          keys: ['expiration_time'],
        },
      ]}
      tabs={!hideTabs && PROJECT_TEAM_TABLE_TABS}
      hasQuery={true}
      tableActions={
        <>
          <ProjectPermissionsLogButton projectId={projectUuid} />
          <TeamDropdownActions
            project={
              project ||
              ({
                uuid: projectUuid,
                customer_uuid: customerUuid,
              } as any)
            }
            refetch={tableProps.fetch}
          />
        </>
      }
      title={translate('Team')}
      verboseName={translate('Team members')}
      rowActions={({ row, fetch }) => (
        <ProjectPermisionActions
          row={row}
          fetch={fetch}
          projectUuid={projectUuid}
          customerUuid={customerUuid}
        />
      )}
      filters={<ProjectUsersListFilter />}
      hasOptionalColumns
      enableMultiSelect
      multiSelectActions={ProjectUsersBulkRemoveButton}
    />
  );
};
