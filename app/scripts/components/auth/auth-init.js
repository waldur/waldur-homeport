import template from './auth-init.html';

export default function authInit() {
  return {
    restrict: 'E',
    controller: AuthInitController,
    controllerAs: 'InitialData',
    template: template,
    scope: {},
    bindToController: true
  };
}

// @ngInject
function AuthInitController(
  usersService,
  $state,
  ENV,
  ncUtilsFlash) {
  angular.extend(this, {
    user: {},
    pageTitle: ENV.shortPageTitle,
    init: function() {
      this.loadUser();
    },
    loadUser: function() {
      var vm = this;
      vm.loading = true;
      usersService.getCurrentUser().then(function(response) {
        vm.user = response;
      }).finally(function() {
        vm.loading = false;
      });
    },
    save: function() {
      return this.saveUser().then(function() {
        $state.go('profile.details');
      });
    },
    saveUser: function() {
      return this.user.$update(function() {
        usersService.currentUser = null;
      }).catch(function(response) {
        ncUtilsFlash.error('Unable to save user');
        if (response.status === 400) {
          this.errors = response.data;
        }
      }.bind(this));
    }
  });
  this.init();
}
