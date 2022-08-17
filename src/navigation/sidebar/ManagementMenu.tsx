import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import {
  checkIsServiceManager,
  getCustomer,
  getProject,
  getUser,
} from '@waldur/workspace/selectors';

import { MenuAccordion } from './MenuAccordion';
import { MenuItem } from './MenuItem';

export const ManagementMenu = () => {
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);
  const user = useSelector(getUser);
  return (
    <MenuAccordion title={translate('Management')} itemId="management-menu">
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
      {customer && (checkIsServiceManager(customer, user) || user.is_staff) && (
        <MenuItem
          title={translate('Provider')}
          state="marketplace-vendor-offerings"
          params={{ uuid: customer.uuid }}
        />
      )}
    </MenuAccordion>
  );
};
