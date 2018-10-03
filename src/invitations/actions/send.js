// @ngInject
export default function InvitationSendAction(
  InvitationPolicyService,
  invitationService,
  ncUtilsFlash,
  $filter) {
  return context => ({
    title: gettext('Resend'),
    iconClass: 'fa fa-envelope-o',
    statesForResend: ['pending', 'expired'],

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
      if (this.statesForResend.indexOf(invitation.state) === -1) {
        return true;
      }
      return false;
    },

    tooltip: function(invitation) {
      if (!InvitationPolicyService.canManageInvitation(context, invitation)) {
        return $filter('translate')(gettext('You don\'t have permission to send this invitation.'));
      }
      if (this.statesForResend.indexOf(invitation.state) === -1) {
        return $filter('translate')(gettext('Only pending and expired invitations can be sent again.'));
      }
    }
  });
}
