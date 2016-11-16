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
function AuthLoginCompleteController($state, $stateParams, authService, baseControllerClass, usersService) {
  var controllerScope = this;
  var Controller = baseControllerClass.extend({
    init: function() {
      this._super();
      authService.loginSuccess({data: {token: $stateParams.token}});
      $state.go('dashboard.index')
    }
  });

  controllerScope.__proto__ = new Controller();
}
