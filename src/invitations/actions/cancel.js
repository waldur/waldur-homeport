// @ngInject
export default function InvitationCancelAction(
  InvitationPolicyService,
  $filter,
  invitationService,
  ncUtilsFlash) {
  return context => ({
    title: gettext('Cancel'),
    iconClass: 'fa fa-ban',

    callback: function(invitation) {
      invitationService.cancel(invitation.uuid).then(function() {
        ncUtilsFlash.success($filter('translate')(gettext('Invitation has been canceled.')));
        invitation.state = 'canceled';
        context.resetCache();
      }).catch(function() {
        ncUtilsFlash.error($filter('translate')(gettext('Unable to cancel invitation.')));
      });
    },

    isDisabled: function(invitation) {
      if (!InvitationPolicyService.canManageInvitation(context, invitation)) {
        return true;
      }
      if (invitation.state !== 'pending') {
        return true;
      }
      return false;
    },

    tooltip: function(invitation) {
      if (!InvitationPolicyService.canManageInvitation(context, invitation)) {
        return $filter('translate')(gettext('You don\'t have permission to cancel this invitation.'));
      }
      if (invitation.state !== 'pending') {
        return $filter('translate')(gettext('Only pending invitation can be canceled.'));
      }
    }
  });
}
