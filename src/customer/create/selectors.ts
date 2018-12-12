import { createSelector } from 'reselect';

import { isVisible } from '@waldur/store/config';
import { isStaff, getUserCustomerPermissions } from '@waldur/workspace/selectors';
import { OuterState } from '@waldur/workspace/types';

export const expertIsVisible = state => isVisible(state, 'experts');

export const canManageCustomer = (state: any): boolean =>
  state.config.plugins.WALDUR_CORE.OWNER_CAN_MANAGE_CUSTOMER;

export const canCreateOrganization = (state: OuterState): boolean =>
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
  }
);
