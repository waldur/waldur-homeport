import template from './auth-invitation.html';

export default function authInvitation() {
  return {
    restrict: 'E',
    controller: AuthInvitationController,
    template: template,
  };
}

// @ngInject
function AuthInvitationController(
  baseControllerClass,
  ENV,
  $state,
  $timeout,
  invitationService) {
  var controllerScope = this;
  var Controller = baseControllerClass.extend({
    init: function() {
      if (!ENV.invitationsEnabled) {
        $state.go('errorPage.notFound');
        return;
      }
      var invitationUUID = $state.params.uuid;
      this.setInvitationToken(invitationUUID);
      this._super();
    },
    setInvitationToken: function(invitationUUID) {
      invitationService.setInvitationToken(invitationUUID);
      $timeout(function() {
        $state.go('register');
      }, ENV.invitationRedirectTime);
    }
  });

  controllerScope.__proto__ = new Controller();
}
