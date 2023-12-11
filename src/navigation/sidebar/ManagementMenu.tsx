import { useCurrentStateAndParams } from '@uirouter/react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import {
  getCustomer,
  getProject,
  isOwnerOrStaff as isOwnerOrStaffSelector,
} from '@waldur/workspace/selectors';

import { MenuItem } from './MenuItem';

const IconOrganization = require('./Organization.svg');
const IconProject = require('./Project.svg');

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
            // The following state will highlight the "Add resource" menu item
            [
              'marketplace-offering-customer',
              'organization.call-management',
            ].includes(state.name)
              ? undefined
              : 'organization'
          }
          iconPath={IconOrganization}
          child={false}
        />
      ) : (
        <MenuItem
          title={translate('Organization')}
          state="profile.no-customer"
          iconPath={IconOrganization}
          child={false}
        />
      )}
      {customer?.projects_count && project ? (
        <MenuItem
          title={translate('Project')}
          state="project.dashboard"
          activeState={
            [
              'marketplace-project-resources-all',
              'marketplace-project-resources',
              // The following state highlights the "Add resource" menu item
              'marketplace-offering-project',
            ].includes(state.name) || params.resource_uuid
              ? undefined
              : 'project'
          }
          params={{ uuid: project.uuid }}
          iconPath={IconProject}
          child={false}
        />
      ) : null}
    </>
  );
};
