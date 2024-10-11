import { PermissionMap } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { Role } from '@waldur/permissions/types';

import { Invitation } from '../types';

import { InvitationContext } from './types';

export const InvitationPolicyService = {
  // Check user permissions for new invitation
  canManageRole(context: InvitationContext, role: Role) {
    if (!context.roleTypes.includes(role.content_type)) {
      return false;
    }
    const permission = PermissionMap[role.content_type];
    return hasPermission(context.user, {
      permission: permission,
      customerId: context.customer?.uuid,
      projectId: context.project?.uuid,
      scopeId: context.scope?.uuid,
    });
  },

  // Check user permissions for existing invitation
  canManageInvitation(context, invitation: Invitation) {
    if (context.user?.is_staff) {
      return true;
    }
    const permission = PermissionMap[invitation.scope_type];
    return hasPermission(context.user, {
      permission: permission,
      customerId: context.customer?.uuid,
      projectId: context.project?.uuid,
      scopeId: invitation.scope_uuid,
    });
  },

  // Check user permissions to see invitations
  canAccessInvitations(context) {
    if (context.user?.is_staff) {
      return true;
    }
    return Object.values(PermissionMap).some((permission) =>
      hasPermission(context.user, {
        permission,
        customerId: context.customer?.uuid,
        projectId: context.project?.uuid,
      }),
    );
  },
};
