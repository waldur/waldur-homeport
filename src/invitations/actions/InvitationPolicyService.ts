import { ENV } from '@waldur/configs/default';
import { CUSTOMER_OWNER_ROLE, PROJECT_ROLES } from '@waldur/core/constants';
import { checkIsOwner } from '@waldur/workspace/selectors';

export const InvitationPolicyService = {
  // This service provides business logic for invitation permissions:
  // 1) Staff can manage any invitation.
  // 2) Non-owner (namely customer support, project manager or system admin) can not manage invitations.
  // 3) Owner can manage any project invitation.
  // 4) Owner can manage customer invitation only if OWNERS_CAN_MANAGE_OWNERS is true.

  // Check user permissions for new invitation
  canManageRole(context, role) {
    if (context.user.is_staff) {
      return true;
    }
    if (!checkIsOwner(context.customer, context.user)) {
      return false;
    }
    if (PROJECT_ROLES.includes(role.value)) {
      return true;
    }
    if (role.value === CUSTOMER_OWNER_ROLE) {
      return ENV.plugins.WALDUR_CORE.OWNERS_CAN_MANAGE_OWNERS;
    }
  },

  // Check user permissions for existing invitation
  canManageInvitation(context, invitation) {
    if (context.user.is_staff) {
      return true;
    }
    if (!checkIsOwner(context.customer, context.user)) {
      return false;
    }
    if (invitation.project_role) {
      return true;
    }
    if (invitation.customer_role) {
      return ENV.plugins.WALDUR_CORE.OWNERS_CAN_MANAGE_OWNERS;
    }
  },
};
