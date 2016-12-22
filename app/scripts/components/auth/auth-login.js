import template from './auth-login.html';

export default function authLogin() {
  return {
    restrict: 'E',
    controller: AuthLoginController,
    controllerAs: 'auth',
    template: template,
    scope: {}
  };
}

// TODO:
//
// 1) This controller should NOT depend on baseControllerClass,
//    because it has been deprecated. Instead ES6 class should be used
//
// 2) This controller should NOT depend on invitationService
//    and on invitations module in general, because it leads to circular dependency
//
// 3) In order to break circular dependency we need to implement registry of enabled
//    registration methods. When invitation token is checked,
//    this registry should be updated
//
// 4) This controller should not broadcast signals, it should be done by service
//
// 5) Error formatting code should be moved to utils service.

// @ngInject
function AuthLoginController(ENV, $q, $sce, $scope, $state, authService,
                             baseControllerClass, ncUtilsFlash, $rootScope, invitationService) {
  var controllerScope = this;
  var Controller = baseControllerClass.extend({
    isSignupFormVisible: $state.current.data.isSignupFormVisible,
    user: {},
    errors: {},
    openidUrl: $sce.trustAsResourceUrl(ENV.apiEndpoint + 'api-auth/openid/login/?next=/api-auth/login_complete'),
    shortPageTitle: ENV.shortPageTitle,
    civilNumberRequired: false,
    init: function() {
      if (ENV.invitationsEnabled && $state.current.name === 'register') {
        if (!invitationService.getInvitationToken()) {
          $state.go('errorPage.notFound');
          return;
        } else {
          this.checkRegistrationMethods();
        }
      }
      this._super();
    },
    checkRegistrationMethods: function() {
      var vm = this;
      invitationService.check(invitationService.getInvitationToken()).then(function(result) {
        if (result.data.civil_number_required) {
          vm.civilNumberRequired = true;
        }
      }, function() {
        $state.go('errorPage.notFound');
      });
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
      return authService.authenticate(provider).then(vm.loginSuccess.bind(vm), vm.loginError.bind(vm));
    },
    loginSuccess: function() {
      return $state.go('dashboard.index', {}, {reload: true});
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
