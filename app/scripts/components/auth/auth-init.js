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
  invitationService,
  $q,
  $state,
  ENV,
  ncUtilsFlash,
  acceptInvitationHandler) {
  angular.extend(this, {
    user: {},
    pageTitle: ENV.shortPageTitle,
    init: function() {
      this.checkInvitation();
      this.loadUser();
    },
    checkInvitation: function() {
      if (ENV.invitationsEnabled && !invitationService.getInvitationToken()) {
        ncUtilsFlash.error('Invitation token is not found');
        $state.go('errorPage.notFound');
      }
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
      var promises = [this.saveUser()];
      if (ENV.invitationsEnabled) {
        promises.push(this.acceptInvitation())
      }
      return $q.all(promises).then(function() {
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
    },
    acceptInvitation: function() {
      var token = invitationService.getInvitationToken();
      return acceptInvitationHandler.acceptInvitation(token, 'userInitialSave');
    }
  });
  this.init();
}
