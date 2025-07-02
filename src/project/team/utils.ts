import { createSelector } from 'reselect';

import { getCustomer, getUser } from '@waldur/workspace/selectors';

export const hasCurrentCustomerPermission = createSelector(
  getUser,
  getCustomer,
  (user, customer) =>
    user.permissions?.find(
      ({ scope_uuid, scope_type }) =>
        scope_uuid === customer.uuid && scope_type === 'customer',
    ),
);
