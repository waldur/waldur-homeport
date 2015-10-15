'use strict';

(function() {
  angular.module('ncsaas')
    .controller('AuthController', ['$state', 'authService', 'baseControllerClass', 'ncUtilsFlash', AuthController]);

  function AuthController($state, authService, baseControllerClass, ncUtilsFlash) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      isSignupFormVisible: false,
      user: {},
      errors: {},

      init: function() {
        this._super();
      },
      signin: function() {
        var vm = this;
        authService.signin(vm.user.username, vm.user.password).then(vm.loginSuccess.bind(vm), vm.loginError.bind(vm));
      },
      authenticate: function(provider) {
        var vm = this;
        authService.authenticate(provider).then(vm.loginSuccess.bind(vm), vm.loginError.bind(vm));
      },
      loginSuccess: function() {
        $state.go('dashboard.index');
      },
      loginError: function(response) {
        if (response.status != 400) {
          this.errors[response.status] = response.statusText + ' Authentication failed';
        } else {
          this.errors = response.data;
        }
      },
      getErrors: function() {
        var vm = this;
        if (vm.errors !== undefined) {
          var prettyErrors = [];
          for (var key in vm.errors) {
            if (vm.errors.hasOwnProperty(key)) {
              if (Object.prototype.toString.call(vm.errors[key]) === '[object Array]') {
                prettyErrors.push(key + ': ' + vm.errors[key].join(', '));
              } else {
                prettyErrors.push(key + ': ' + vm.errors[key]);
              }
            }
          }
          return prettyErrors;
        } else {
          return '';
        }
      },
      signup: function() {
        var vm = this;
        vm.errors = {};
        authService.signup(vm.user).then(function() {
          ncUtilsFlash.infoFlash('Confirmation mail has been sent. Please check your inbox!');
          vm.isSignupFormVisible = false;
          vm.user = {};
        }, function(response) {
          vm.errors = response.data;
        });
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('ActivationController', [
      '$state', '$stateParams', 'authService', 'baseControllerClass', 'ncUtilsFlash', ActivationController]);

  function ActivationController($state, $stateParams, authService, baseControllerClass, ncUtilsFlash) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      init: function() {
        this._super();
        authService.activate({
          user_uuid: $stateParams.user_uuid,
          token: $stateParams.token
        }).then(function() {
          ncUtilsFlash.infoFlash('Account has been activated');
          $state.go('dashboard.index');
        }, function(response) {
          ncUtilsFlash.errorFlash('Unable to activate account');
        });
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();
