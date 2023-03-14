import { useCurrentStateAndParams } from '@uirouter/react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import {
  checkIsServiceManager,
  getCustomer,
  getProject,
  getUser,
  isOwnerOrStaff as isOwnerOrStaffSelector,
} from '@waldur/workspace/selectors';

import { MenuItem } from './MenuItem';

const IconOrganization = require('./Organization.svg');
const IconProject = require('./Project.svg');
const IconProvider = require('./Service_Provider.svg');

export const ManagementMenu = () => {
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);
  const user = useSelector(getUser);
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
  const { state, params } = useCurrentStateAndParams();
  return (
    <>
      {!isOwnerOrStaff ? null : customer ? (
        <MenuItem
          title={translate('Organization')}
          state="organization.dashboard"
          params={{ uuid: customer.uuid }}
          activeState="organization"
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
      {project ? (
        <MenuItem
          title={translate('Project')}
          state="project.dashboard"
          activeState={
            [
              'marketplace-project-resources-all',
              'marketplace-project-resources',
            ].includes(state.name) || params.resource_uuid
              ? undefined
              : 'project'
          }
          params={{ uuid: project.uuid }}
          iconPath={IconProject}
          child={false}
        />
      ) : (
        <MenuItem
          title={translate('Project')}
          state="profile.no-project"
          iconPath={IconProject}
          child={false}
        />
      )}
      {customer &&
        customer.is_service_provider &&
        (checkIsServiceManager(customer, user) || isOwnerOrStaff) && (
          <MenuItem
            title={translate('Provider')}
            state="marketplace-vendor-offerings"
            params={{ uuid: customer.uuid }}
            activeState="marketplace-provider"
            iconPath={IconProvider}
            child={false}
          />
        )}
    </>
  );
};
