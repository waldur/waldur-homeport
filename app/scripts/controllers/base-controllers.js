'use strict';

(function() {
  angular.module('ncsaas')
    .service('BaseErrorController', ['$rootScope', '$state', 'baseControllerClass', BaseErrorController]);

  function BaseErrorController($rootScope, $state, baseControllerClass) {
    var Controller = baseControllerClass.extend({
      init: function() {
        var state = $rootScope.prevPreviousState;
        this.href = (state && state.name !== 'errorPage.notFound' && state.name !== 'errorPage.limitQuota')
          ? $state.href(state.name, $rootScope.prevPreviousParams)
          : $state.href('profile.details');
      }
    });
    return Controller;
  }

  angular.module('ncsaas')
    .controller('Error403Controller', [
      'BaseErrorController', 'currentStateService', Error403Controller]);

  function Error403Controller(BaseErrorController, currentStateService) {
    var controllerScope = this;
    var Controller = BaseErrorController.extend({
      init: function() {
        var vm = this;
        currentStateService.getCustomer().then(function(response) {
          vm.customer = response;
        });
        this._super();
      }
    });

    controllerScope.__proto__ = new Controller();
  }

  angular.module('ncsaas')
    .controller('Error404Controller', ['BaseErrorController', Error404Controller]);
  
  function Error404Controller(BaseErrorController) {
    var controllerScope = this;
    var Controller = BaseErrorController.extend({
      init: function() {
        this._super();
      }
    });
    controllerScope.__proto__ = new Controller();
  }

  angular.module('ncsaas')
    .controller('BaseController', ['baseControllerClass', '$auth', BaseController]);

  function BaseController(baseControllerClass, $auth) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      init: function() {
        this.isAuthenticated = $auth.isAuthenticated();
      }
    });
    controllerScope.__proto__ = new Controller();
  }

})();
