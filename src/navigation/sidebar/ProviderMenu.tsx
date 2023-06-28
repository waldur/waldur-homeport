import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import {
  checkIsServiceManager,
  getUser,
  getCustomer,
  isOwnerOrStaff as isOwnerOrStaffSelector,
} from '@waldur/workspace/selectors';

import { MenuItem } from './MenuItem';

const IconProvider = require('./Service_Provider.svg');

export const ProviderMenu = () => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
  return (
    <>
      {customer &&
        customer.is_service_provider &&
        (checkIsServiceManager(customer, user) || isOwnerOrStaff) && (
          <MenuItem
            title={translate('Provider')}
            state="marketplace-provider-dashboard"
            params={{ uuid: customer.uuid }}
            activeState="marketplace-provider"
            iconPath={IconProvider}
            child={false}
          />
        )}
    </>
  );
};
