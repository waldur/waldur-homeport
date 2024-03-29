import {
  CUSTOMER_OWNER_ROLE,
  PROJECT_ADMIN_ROLE,
  PROJECT_MEMBER_ROLE,
  PROJECT_ROLES,
} from '@waldur/core/constants';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import {
  checkIsOwner,
  isProjectManagerSelector,
} from '@waldur/workspace/selectors';

export const InvitationPolicyService = {
  // This service provides business logic for invitation permissions:
  // 1) Staff can manage any invitation.
  // 2) Non-owner (namely customer support or system admin) can not manage invitations.
  // 3) Owner can manage any project invitation.
  // 4) Owner can manage customer invitation only if he has permission.
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
        return hasPermission(context.user, {
          permission: PermissionEnum.CREATE_CUSTOMER_PERMISSION,
          customerId: context.customer.uuid,
        });
      }
    }
    if (isProjectManagerSelector(context.user, context.project)) {
      return [PROJECT_ADMIN_ROLE, PROJECT_MEMBER_ROLE].includes(role.value);
    }
    return false;
  },

  // Check user permissions for existing invitation
  canManageInvitation(context, invitation) {
    if (
      context.user?.is_staff ||
      checkIsOwner(context.customer, context.user)
    ) {
      return true;
    }
    if (invitation.customer_role) {
      return hasPermission(context.user, {
        permission: PermissionEnum.CREATE_CUSTOMER_PERMISSION,
        customerId: context.customer.uuid,
      });
    }
    if (invitation.project_role && !context.project) {
      return checkIsOwner(context.customer, context.user);
    }
    if (invitation.project_role && context.project) {
      return isProjectManagerSelector(context.user, context.project);
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
    return isProjectManagerSelector(context.user, context.project);
  },
};
