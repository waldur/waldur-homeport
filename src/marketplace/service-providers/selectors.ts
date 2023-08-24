import { createSelector } from 'reselect';

import { PermissionEnum, hasPermission } from '@waldur/core/permissions';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

export const canRegisterServiceProviderForCustomer = createSelector(
  getUser,
  getCustomer,
  (user, customer) =>
    hasPermission(user, {
      permission: PermissionEnum.REGISTER_SERVICE_PROVIDER,
      customerId: customer.uuid,
    }),
);
