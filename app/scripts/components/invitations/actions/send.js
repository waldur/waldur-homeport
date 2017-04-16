// @ngInject
export default function InvitationSendAction(
  InvitationPolicyService,
  invitationService,
  ncUtilsFlash,
  $filter) {
  return context => ({
    title: gettext('Resend'),
    iconClass: 'fa fa-envelope-o',

    callback: function(invitation) {
      invitationService.resend(invitation.uuid).then(function() {
        ncUtilsFlash.success($filter('translate')(gettext('Invitation has been sent again.')));
      }).catch(function() {
        ncUtilsFlash.error($filter('translate')(gettext('Unable to resend invitation.')));
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
        return $filter('translate')(gettext('You don\'t have permission to send this invitation.'));
      }
      if (invitation.state !== 'pending') {
        return $filter('translate')(gettext('Only pending invitation can be sent again.'));
      }
    }
  });
}
