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
    ncUtilsFlash.info('Account has been activated');
    $state.go('initialdata.view');
  }, function(response) {
    ncUtilsFlash.error('Unable to activate account');
  });
}
