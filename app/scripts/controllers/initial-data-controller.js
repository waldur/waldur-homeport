'use strict';

(function() {

  angular.module('ncsaas')
    .controller('InitialDataController', InitialDataController);

  InitialDataController.$inject = ['usersService',
    'invitationService',
    '$q',
    '$state',
    'ENV',
    'ncUtils'];

  function InitialDataController(
    usersService,
    invitationService,
    $q,
    $state,
    ENV,
    ncUtils) {
    angular.extend(this, {
      user: {},
      invitation: {},
      pageTitle: ENV.shortPageTitle,

      init: function() {
        this.loading = true;
        this.loadData().finally(function() {
          this.loading = false;
        }.bind(this));
      },
      loadData: function() {
        var vm = this;
        if (!ENV.invitationsEnabled) {
          return vm.getUser();
        } else {
          return vm.checkInvitation().then(function(invitation) {
            vm.invitation = invitation;
            if (vm.invitation.state !== 'pending') {
              return $state.go('errorPage.notFound');
            }
            return vm.getUser();
          }, function() {
            return $state.go('errorPage.notFound');
          });
        }
      },
      getUser: function() {
        var vm = this;
        return usersService.getCurrentUser().then(function(response) {
          vm.user = response;
          vm.user.email = vm.invitation && vm.invitation.email ? vm.invitation.email : response.email;
          if (!vm.user.registration_method) {
            return;
          } else if (vm.user.registration_method === 'openid') {
            vm.registration_method = 'Estonian ID';
          } else {
            vm.registration_method = vm.user.registration_method[0].toUpperCase() + vm.user.registration_method.slice(1);
          }
        });
      },
      saveUser: function() {
        var vm = this;
        return vm.user.$update(function() {
          usersService.currentUser = null;
        });
      },
      gotoNextState: function () {
        if (!ENV.invitationsEnabled) {
          $state.go('profile.details');
        } else if (this.invitation.customer) {
          $state.go('dashboard.index');
        } else if (this.invitation.project) {
          $state.go('project.details');
        }
      },
      checkInvitation: function() {
        return invitationService.$get(invitationService.getInvitationToken());
      },
      save: function() {
        var vm = this;
        var promise = $q.when(true);
        if (ENV.invitationsEnabled) {
          promise = invitationService.accept(this.invitation.uuid).then(function() {
            invitationService.clearInitationToken();
          });
        }

        return promise
          .then(this.saveUser.bind(this))
          .then(this.gotoNextState.bind(this))
          .catch(function(response) {
            vm.errors = response.data;
          });
      }
    });
    this.init();
  }
})();
