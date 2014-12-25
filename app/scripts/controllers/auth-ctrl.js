'use strict';

(function() {
  angular.module('ncsaas')
    .controller('AuthCtrl', ['$location', 'auth', AuthCtrl]);

  function AuthCtrl($location, auth) {
    var vm = this;
    vm.isSignupFormVisible = false;
    vm.signin = signin;
    vm.user = {};
    vm.hasErrors = hasErrors;
    vm.getErrors = getErrors;

    function signin() {
      auth.signin(vm.user.username, vm.user.password).then(success, error);

      function success() {
        $location.path('/');
      }

      function error(response) {
        vm.errors = response.data;
      }
    }

    function hasErrors() {
      return vm.errors;
    }

    function getErrors() {
      if (vm.errors !== undefined) {
        var prettyErrors = [];
        for (var key in vm.errors) {
          if (vm.errors.hasOwnProperty(key)) {
            var errorList = vm.errors[key];
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
