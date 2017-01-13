import template from './auth-login-complete.html';

export default function authLoginComplete() {
  return {
    restrict: 'E',
    controller: AuthLoginCompleteController,
    controllerAs: 'auth',
    template: template,
    scope: {}
  };
}

// @ngInject
function AuthLoginCompleteController($state, $stateParams, authService) {
  authService.loginSuccess({data: {token: $stateParams.token}});
  $state.go('profile.details');
}
