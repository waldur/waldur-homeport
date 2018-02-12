import template from './auth-login-completed.html';

// @ngInject
function AuthLoginCompletedController($state, $stateParams, authService) {
  authService.loginSuccess({data: {token: $stateParams.token, method: $stateParams.method}});
  $state.go('profile.details');
}

const authLoginCompleted = {
  template: template,
  controller: AuthLoginCompletedController,
};

export default authLoginCompleted;
