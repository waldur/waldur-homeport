import template from './invitation-accept.html';

export default function invitationAccept() {
  return {
    restrict: 'E',
    controller: InvitationAcceptController,
    controllerAs: '$ctrl',
    template: template,
    scope: {},
    bindToController: true
  };
}

// @ngInject
function InvitationAcceptController(ENV, $state, invitationUtilsService) {
  if (!ENV.plugins.WALDUR_CORE.INVITATIONS_ENABLED) {
    $state.go('errorPage.notFound');
    return;
  }
  invitationUtilsService.checkAndAccept($state.params.uuid);
}
