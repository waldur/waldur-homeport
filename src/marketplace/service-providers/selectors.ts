import { Customer, User } from 'waldur-js-client';

import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';

export const canRegisterServiceProviderForCustomer = (
  user: User,
  customer: Customer,
) =>
  hasPermission(user, {
    permission: PermissionEnum.REGISTER_SERVICE_PROVIDER,
    customerId: customer.uuid,
  });
