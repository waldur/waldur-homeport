import template from './auth-login-complete.html';

// @ngInject
function AuthLoginCompleteController($state, $stateParams, authService) {
  authService.loginSuccess({data: {token: $stateParams.token}});
  $state.go('profile.details');
}

const authLoginComplete = {
  template: template,
  controller: AuthLoginCompleteController,
};

export default authLoginComplete;
