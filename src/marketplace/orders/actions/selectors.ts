import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';

export const checkOrderCanBeApproved = (user, customer, project) =>
  hasPermission(user, {
    permission: PermissionEnum.APPROVE_ORDER,
    customerId: customer?.uuid,
    projectId: project?.uuid,
  });
