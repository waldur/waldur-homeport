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
function AuthActivationController($location, $stateParams, authService, baseControllerClass, ncUtilsFlash) {
  var controllerScope = this;
  var Controller = baseControllerClass.extend({
    init: function() {
      this._super();
      authService.activate({
        user_uuid: $stateParams.user_uuid,
        token: $stateParams.token
      }).then(function() {
        ncUtilsFlash.info('Account has been activated');
        // TODO: find the way to avoid hardcode for the path
        $location.path('/initial-data/');
      }, function(response) {
        ncUtilsFlash.error('Unable to activate account');
      });
    }
  });

  controllerScope.__proto__ = new Controller();
}
