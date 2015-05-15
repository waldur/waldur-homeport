'use strict';

(function() {
  angular.module('ncsaas')
    .controller('AuthController', ['$state', 'flash', 'authService', AuthController]);

  function AuthController($state, flash, authService) {
    var vm = this;
    vm.isSignupFormVisible = false;
    vm.signin = signin;
    vm.user = {};
    vm.hasErrors = hasErrors;
    vm.getErrors = getErrors;
    vm.authenticate = authenticate;

    function signin() {
      authService.signin(vm.user.username, vm.user.password).then(loginSuccess, loginError);
    }

    function authenticate(provider) {
      authService.authenticate(provider).then(loginSuccess, loginError);
    }

    function loginSuccess() {
      flash('Successful authorization!');
      $state.go('dashboard.eventlog');
    }

    function loginError(response) {
      vm.errors = response.data;
    }

    function hasErrors() {
      return vm.errors;
    }

    function getErrors() {
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
  }

})();
