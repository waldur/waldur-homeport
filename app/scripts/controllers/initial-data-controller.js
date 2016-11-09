'use strict';
(function() {
  angular.module('ncsaas')
    .controller('InitialDataController', InitialDataController);
  InitialDataController.$inject = ['usersService',
    'invitationService',
    '$q',
    '$state',
    'ENV',
    'ncUtilsFlash'];
  function InitialDataController(
    usersService,
    invitationService,
    $q,
    $state,
    ENV,
    ncUtilsFlash) {
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
        return invitationService.accept(token).catch(function(response) {
          if (response.status === 400) {
            ncUtilsFlash.error('Invitation is invalid');
            $state.go('errorPage.notFound');
          } else {
            // Server or connection error
            ncUtilsFlash.error('Unable to accept invitation');
          }
        }).then(function() {
          // Don't use the same token twice
          invitationService.clearInitationToken();
        });
      }
    });
    this.init();
  }
})();
