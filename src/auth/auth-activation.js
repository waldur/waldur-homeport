import template from './auth-activation.html';

export default function authActivation() {
  return {
    restrict: 'E',
    controller: AuthActivationController,
    controllerAs: 'auth',
    template: template,
    scope: {}
  };
}

// @ngInject
function AuthActivationController($state, $stateParams, authService, ncUtilsFlash) {
  authService.activate({
    user_uuid: $stateParams.user_uuid,
    token: $stateParams.token
  }).then(function() {
    ncUtilsFlash.info(gettext('Account has been activated.'));
    $state.go('initialdata.view');
  }, function() {
    ncUtilsFlash.error(gettext('Unable to activate account.'));
  });
}
