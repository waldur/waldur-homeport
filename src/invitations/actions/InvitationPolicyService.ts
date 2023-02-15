import { ENV } from '@waldur/configs/default';
import {
  CUSTOMER_OWNER_ROLE,
  PROJECT_ADMIN_ROLE,
  PROJECT_MANAGER_ROLE,
  PROJECT_MEMBER_ROLE,
  PROJECT_ROLES,
} from '@waldur/core/constants';
import { checkIsOwner, checkRole } from '@waldur/workspace/selectors';

export const InvitationPolicyService = {
  // This service provides business logic for invitation permissions:
  // 1) Staff can manage any invitation.
  // 2) Non-owner (namely customer support or system admin) can not manage invitations.
  // 3) Owner can manage any project invitation.
  // 4) Owner can manage customer invitation only if OWNERS_CAN_MANAGE_OWNERS is true.
  // 5) Project manager can manage project admin and member invitations.

  // Check user permissions for new invitation
  canManageRole(context, role) {
    if (context.user?.is_staff) {
      return true;
    }
    if (checkIsOwner(context.customer, context.user)) {
      if (PROJECT_ROLES.includes(role.value)) {
        return true;
      }
      if (role.value === CUSTOMER_OWNER_ROLE) {
        return ENV.plugins.WALDUR_CORE.OWNERS_CAN_MANAGE_OWNERS;
      }
    }
    if (checkRole(context.project, context.user, PROJECT_MANAGER_ROLE)) {
      return [PROJECT_ADMIN_ROLE, PROJECT_MEMBER_ROLE].includes(role.value);
    }
    return false;
  },

  // Check user permissions for existing invitation
  canManageInvitation(context, invitation) {
    if (context.user?.is_staff) {
      return true;
    }
    if (invitation.customer_role) {
      return (
        checkIsOwner(context.customer, context.user) &&
        ENV.plugins.WALDUR_CORE.OWNERS_CAN_MANAGE_OWNERS
      );
    }
    if (invitation.project_role && !context.project) {
      return checkIsOwner(context.customer, context.user);
    }
    if (invitation.project_role && context.project) {
      return checkRole(context.project, context.user, PROJECT_MANAGER_ROLE);
    }
  },

  // Check user permissions to see invitations
  canAccessInvitations(context) {
    if (context.user?.is_staff) {
      return true;
    }
    if (checkIsOwner(context.customer, context.user)) {
      return true;
    }
    if (checkRole(context.project, context.user, PROJECT_MANAGER_ROLE)) {
      return true;
    }
    return false;
  },
};
