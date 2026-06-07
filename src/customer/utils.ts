import {
  customersRetrieve,
  CustomersRetrieveData,
  Options,
} from 'waldur-js-client';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { hasPermission } from '@/permissions/hasPermission';
import {
  getCustomer as getCustomerSelector,
  getUser,
  hasNonProjectPermissions,
} from '@/workspace/selectors';

export const userHasCustomerPermission = (permission) => (state) => {
  const user = getUser(state);
  const customer = getCustomerSelector(state);
  if (!customer) return false;
  const customerId = customer.uuid;
  return (
    hasPermission(user, {
      customerId,
      permission,
    }) ||
    hasPermission(
      {
        ...user,
        permissions: user.permissions
          .filter((perm) => perm.customer_uuid === customerId)
          .map((perm) => ({
            ...perm,
            scope_uuid: customerId,
            scope_type: 'customer',
          })),
      },
      {
        customerId,
        permission,
      },
    )
  );
};

export const canAccessOrganization = (state) => {
  const hideFromProjectMembers = isFeatureVisible(
    MarketplaceFeatures.hide_organization_information_from_project_members,
  );
  if (!hideFromProjectMembers) {
    return true;
  }
  return hasNonProjectPermissions(state);
};

export const getCustomer = (
  customerId: string,
  field: Options<CustomersRetrieveData, false>['query']['field'] = null,
) =>
  customersRetrieve({
    path: { uuid: customerId },
    ...(field ? { query: { field } } : {}),
  }).then((r) => r.data);
