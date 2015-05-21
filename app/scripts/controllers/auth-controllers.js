'use strict';

(function() {
  angular.module('ncsaas')
    .controller('AuthController', ['$state', 'Flash', 'authService', 'baseControllerClass', AuthController]);

  function AuthController($state, Flash, authService, baseControllerClass) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      isSignupFormVisible: false,
      user: {},

      init: function() {
        this._super();
      },
      signin: function() {
        var vm = this;
        authService.signin(vm.user.username, vm.user.password).then(vm.loginSuccess, vm.loginError.bind(vm));
      },
      authenticate: function(provider) {
        var vm = this;
        authService.authenticate(provider).then(vm.loginSuccess, vm.loginError.bind(vm));
      },
      loginSuccess: function() {
        Flash.create('success', 'Successful authorization!');
        $state.go('dashboard.eventlog');
      },
      loginError: function(response) {
        this.errors = response.data;
      },
      hasErrors: function() {
        return this.errors;
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
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();
