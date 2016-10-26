'use strict';

(function() {
  angular.module('ncsaas')
    .controller('AuthController', 
      ['ENV', '$q', '$sce', '$scope', '$state', 'authService',
      'baseControllerClass', 'ncUtilsFlash', '$rootScope', '$window', AuthController]);

  function AuthController(ENV, $q, $sce, $scope, $state, authService,
    baseControllerClass, ncUtilsFlash, $rootScope, $window) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      isSignupFormVisible: $state.current.data.isSignupFormVisible,
      user: {},
      errors: {},
      openidUrl: $sce.trustAsResourceUrl(ENV.apiEndpoint + 'api-auth/openid/login/?next=/api-auth/login_complete'),

      init: function() {
        this._super();
      },
      signin: function() {
        if ($scope.auth.LoginForm.$invalid) {
          return $q.reject();
        }
        var vm = this;
        $rootScope.$broadcast('enableRequests');
        return authService.signin(vm.user.username, vm.user.password).then(vm.loginSuccess.bind(vm), vm.loginError.bind(vm));
      },
      authenticate: function(provider) {
        var vm = this;
        $rootScope.$broadcast('enableRequests');
        authService.authenticate(provider).then(vm.loginSuccess.bind(vm), vm.loginError.bind(vm));
      },
      loginSuccess: function() {
        $state.go('dashboard.index', {}, {reload: true});
        return true;
      },
      loginError: function(response) {
        this.errors = [];
        if (response.status != 400 && +response.status > 0) {
          this.errors[response.status] = response.statusText + ' Authentication failed';
        } else {
          this.errors = response.data;
        }
      },
      getErrors: function() {
        var vm = this;
        if (vm.errors !== undefined) {
          var prettyErrors = [];
          if (Object.prototype.toString.call(vm.errors) === '[object String]') {
            prettyErrors.push(vm.errors);
            return prettyErrors;
          }
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
        if (!$window.localStorage[ENV.invitationStorageToken]) {
          $state.go('errorPage.notFound');
          return;
        }
        if ($scope.auth.RegisterForm.$invalid) {
          return $q.reject();
        }
        var vm = this;
        vm.errors = {};
        $rootScope.$broadcast('enableRequests');
        return authService.signup(vm.user).then(function() {
          ncUtilsFlash.info('Confirmation mail has been sent. Please check your inbox!');
          vm.isSignupFormVisible = false;
          vm.user = {};
          return true;
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
      '$location', '$stateParams', 'authService', 'baseControllerClass', 'ncUtilsFlash', ActivationController]);

  function ActivationController($location, $stateParams, authService, baseControllerClass, ncUtilsFlash) {
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
})();


(function() {
  angular.module('ncsaas')
    .controller('LoginCompleteController', [
      '$state', '$stateParams', 'authService', 'baseControllerClass', 'usersService', LoginCompleteController]);

  function LoginCompleteController($state, $stateParams, authService, baseControllerClass, usersService) {
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
})();
