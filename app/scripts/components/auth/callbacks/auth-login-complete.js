import template from './auth-login-complete.html';

const authLoginComplete = {
  template: template,
  controller: function AuthLoginCompleteController($state, $stateParams, authService) {
    // @ngInject
    authService.loginSuccess({data: {token: $stateParams.token}});
    $state.go('profile.details');
  }
};

export default authLoginComplete;
