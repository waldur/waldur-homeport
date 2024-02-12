import { createSelector } from 'reselect';

import { RootState } from '@waldur/store/reducers';
import { isStaff, getUser } from '@waldur/workspace/selectors';

export const canManageCustomer = (state: RootState): boolean =>
  state.config.plugins.WALDUR_CORE.OWNER_CAN_MANAGE_CUSTOMER;

export const canCreateOrganization = (state: RootState): boolean =>
  isStaff(state) || canManageCustomer(state);

export const renderCustomerCreatePrompt = createSelector(
  isStaff,
  getUser,
  canManageCustomer,
  (staff, user, ownerCanManageCustomer) => {
    if (staff) {
      return (
        user.permissions.filter((perm) => perm.scope_type === 'customer')
          .length === 0
      );
    }
    return (
      user.permissions.filter((perm) => perm.scope_type === 'customer')
        .length === 0 && ownerCanManageCustomer
    );
  },
);
