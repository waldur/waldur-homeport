import { createSelector } from 'reselect';

import { isVisible } from '@waldur/store/config';
import { isStaff, getUserCustomerPermissions } from '@waldur/workspace/selectors';
import { OuterState } from '@waldur/workspace/types';

export const serviceProviderIsVisible = state => isVisible(state, 'marketplace');
export const expertIsVisible = state => isVisible(state, 'experts');

export const canManageCustomer = (state: any): boolean =>
  state.config.ownerCanManageCustomer;

export const canRegisterServiceProvider = (state: any): boolean =>
  state.config.plugins.WALDUR_MARKETPLACE.OWNER_CAN_REGISTER_SERVICE_PROVIDER;

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

export const renderServiceProvider = createSelector(
  serviceProviderIsVisible,
  isStaff,
  canRegisterServiceProvider,
  (serviceProvider, staff, registerServiceProvider) => {
    if (!serviceProvider) {
      return false;
    }
    if (staff) {
      return true;
    }
    return registerServiceProvider;
  }
);
