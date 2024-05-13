import { Buildings, ClipboardText } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import {
  getCustomer,
  getProject,
  isOwnerOrStaff as isOwnerOrStaffSelector,
} from '@waldur/workspace/selectors';

import {
  ORGNIZATION_MENU_EXCLUDE_STATES,
  PROJECT_MENU_EXCLUDE_STATES,
} from '../constants';
import { isDescendantOf } from '../useTabs';

import { MenuItem } from './MenuItem';

export const ManagementMenu = () => {
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
  const { state, params } = useCurrentStateAndParams();
  return (
    <>
      {!isOwnerOrStaff ? null : customer ? (
        <MenuItem
          title={translate('Organization')}
          state="organization.dashboard"
          params={{ uuid: customer.uuid }}
          activeState={
            [
              'organization',
              'call-management',
              'protected-call',
              'marketplace-provider',
            ].some((name) => isDescendantOf(name, state)) &&
            // The following states will highlight the other menu items ("Add resource", "Resource details")
            !ORGNIZATION_MENU_EXCLUDE_STATES.some(
              (name) =>
                state.name.includes(name) ||
                String(state.parent).includes(name),
            )
              ? state.name
              : undefined
          }
          icon={<Buildings />}
          child={false}
        />
      ) : (
        <MenuItem
          title={translate('Organization')}
          state="profile.no-customer"
          icon={<Buildings />}
          child={false}
        />
      )}
      {customer?.projects_count && project ? (
        <MenuItem
          title={translate('Project')}
          state="project.dashboard"
          activeState={
            PROJECT_MENU_EXCLUDE_STATES.includes(state.name) ||
            params.resource_uuid
              ? undefined
              : 'project'
          }
          params={{ uuid: project.uuid }}
          icon={<ClipboardText />}
          child={false}
        />
      ) : null}
    </>
  );
};
