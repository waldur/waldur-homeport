import { createSelector } from 'reselect';

import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { getCustomer, getProject, getUser } from '@/workspace/selectors';

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
