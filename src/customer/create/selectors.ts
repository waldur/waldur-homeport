import { createSelector } from 'reselect';

import { RootState } from '@waldur/store/reducers';
import {
  isStaff,
  getUserCustomerPermissions,
} from '@waldur/workspace/selectors';

export const canManageCustomer = (state: RootState): boolean =>
  state.config.plugins.WALDUR_CORE.OWNER_CAN_MANAGE_CUSTOMER;

export const canCreateOrganization = (state: RootState): boolean =>
  isStaff(state) || canManageCustomer(state);

export const renderCustomerCreatePrompt = createSelector(
  isStaff,
  getUserCustomerPermissions,
  canManageCustomer,
  (staff, userCustomerPermissions, ownerCanManageCustomer) => {
    if (staff) {
      return userCustomerPermissions.length === 0;
    }
    return userCustomerPermissions.length === 0 && ownerCanManageCustomer;
  },
);
