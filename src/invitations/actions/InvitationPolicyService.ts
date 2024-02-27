import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { Role } from '@waldur/permissions/types';

import { Invitation } from '../types';

import { InvitationContext } from './types';

export const InvitationPolicyService = {
  // Check user permissions for new invitation
  canManageRole(context: InvitationContext, role: Role) {
    if (!role.description) {
      return false;
    }
    if (!context.roleTypes.includes(role.content_type)) {
      return false;
    }
    if (role.content_type === 'customer') {
      return hasPermission(context.user, {
        permission: PermissionEnum.CREATE_CUSTOMER_PERMISSION,
        customerId: context.customer.uuid,
      });
    } else if (role.content_type === 'project') {
      return hasPermission(context.user, {
        permission: PermissionEnum.CREATE_PROJECT_PERMISSION,
        projectId: context.project?.uuid,
        customerId: context.customer.uuid,
      });
    } else if (role.content_type === 'call') {
      return hasPermission(context.user, {
        permission: PermissionEnum.CREATE_CALL_PERMISSION,
        customerId: context.customer.uuid,
      });
    }
    return false;
  },

  // Check user permissions for existing invitation
  canManageInvitation(context, invitation: Invitation) {
    if (context.user?.is_staff) {
      return true;
    }
    if (invitation.scope_type === 'customer') {
      return hasPermission(context.user, {
        permission: PermissionEnum.CREATE_CUSTOMER_PERMISSION,
        customerId: context.customer?.uuid,
      });
    } else if (invitation.scope_type === 'project') {
      return hasPermission(context.user, {
        permission: PermissionEnum.CREATE_PROJECT_PERMISSION,
        projectId: context.project?.uuid,
        customerId: context.customer?.uuid,
      });
    } else if (invitation.scope_type === 'call') {
      return hasPermission(context.user, {
        permission: PermissionEnum.CREATE_CALL_PERMISSION,
        customerId: context.customer.uuid,
      });
    }
    return false;
  },

  // Check user permissions to see invitations
  canAccessInvitations(context) {
    if (context.user?.is_staff) {
      return true;
    }
    return (
      hasPermission(context.user, {
        permission: PermissionEnum.CREATE_CUSTOMER_PERMISSION,
        customerId: context.customer?.uuid,
      }) ||
      hasPermission(context.user, {
        permission: PermissionEnum.CREATE_PROJECT_PERMISSION,
        projectId: context.project?.uuid,
        customerId: context.customer?.uuid,
      }) ||
      hasPermission(context.user, {
        permission: PermissionEnum.CREATE_CALL_PERMISSION,
        customerId: context.customer.uuid,
      })
    );
  },
};
