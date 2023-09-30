import { createSelector } from 'reselect';

import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
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
