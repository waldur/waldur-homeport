import { createSelector } from 'reselect';

import { PermissionEnum, hasPermission } from '@waldur/core/permissions';
import { getCustomer, getProject, getUser } from '@waldur/workspace/selectors';

export const orderCanBeApproved = createSelector(
  getUser,
  getCustomer,
  getProject,
  (user, customer, project) =>
    hasPermission(user, {
      permission: PermissionEnum.APPROVE_ORDER,
      customerId: customer?.uuid,
      projectId: project?.uuid,
    }),
);

export const orderCanBeRejected = createSelector(
  getUser,
  getCustomer,
  getProject,
  (user, customer, project) =>
    hasPermission(user, {
      permission: PermissionEnum.REJECT_ORDER,
      customerId: customer?.uuid,
      projectId: project?.uuid,
    }),
);
