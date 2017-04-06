// @ngInject
export default function InvitationPolicyService(ENV) {
  // This service provides business logic for invitation permissions:
  // 1) Staff can manage any invitation.
  // 2) Non-owner (namely customer support, project manager or system admin) can not manage invitations.
  // 3) Owner can manage any project invitation.
  // 4) Owner can manage customer invitation only if OWNERS_CAN_MANAGE_OWNERS is true.

  return {
    canManageRole,
    canManageInvitation,
  };

  // Check user permissions for new invitation
  function canManageRole(context, role) {
    if (context.isStaff) {
      return true;
    }
    if (!context.isOwner) {
      return false;
    }
    if (role.field === 'project_role') {
      return true;
    }
    if (role.field === 'customer_role') {
      return ENV.OWNERS_CAN_MANAGE_OWNERS;
    }
  }

  // Check user permissions for existing invitation
  function canManageInvitation(context, invitation) {
    if (context.isStaff) {
      return true;
    }
    if (!context.isOwner) {
      return false;
    }
    if (invitation.project_role) {
      return true;
    }
    if (invitation.customer_role) {
      return ENV.OWNERS_CAN_MANAGE_OWNERS;
    }
  }
}
