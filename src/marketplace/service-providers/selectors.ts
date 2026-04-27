import { createSelector } from 'reselect';

import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { getCustomer, getUser } from '@/workspace/selectors';

export const canRegisterServiceProviderForCustomer = createSelector(
  getUser,
  getCustomer,
  (user, customer) =>
    hasPermission(user, {
      permission: PermissionEnum.REGISTER_SERVICE_PROVIDER,
      customerId: customer.uuid,
    }),
);
