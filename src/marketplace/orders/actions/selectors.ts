import { createSelector } from 'reselect';

import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
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
