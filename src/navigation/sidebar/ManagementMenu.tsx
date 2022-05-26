import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import {
  checkIsServiceManager,
  getCustomer,
  getProject,
  getUser,
} from '@waldur/workspace/selectors';

import { MenuItem } from './MenuItem';
import { MenuSection } from './MenuSection';

export const ManagementMenu = () => {
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);
  const user = useSelector(getUser);
  return (
    <>
      <MenuSection title={translate('Management')} />
      {customer ? (
        <MenuItem
          title={translate('Organization')}
          state="organization.dashboard"
          params={{ uuid: customer.uuid }}
        />
      ) : (
        <MenuItem
          title={translate('Organization')}
          state="profile.no-customer"
        />
      )}
      {project ? (
        <MenuItem
          title={translate('Project')}
          state="project.details"
          params={{ uuid: project.uuid }}
        />
      ) : (
        <MenuItem title={translate('Project')} state="profile.no-project" />
      )}
      {customer && (
        <MenuItem
          title={translate('Team')}
          state="organization.users"
          params={{ uuid: customer.uuid }}
        />
      )}
      {customer && (checkIsServiceManager(customer, user) || user.is_staff) && (
        <MenuItem
          title={translate('Provider')}
          state="marketplace-vendor-offerings"
          params={{ uuid: customer.uuid }}
        />
      )}
      <div className="menu-item">
        <div className="menu-content">
          <div className="separator mx-1 my-4"></div>
        </div>
      </div>
    </>
  );
};
