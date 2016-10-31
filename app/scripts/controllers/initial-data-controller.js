'use strict';

(function() {

  angular.module('ncsaas')
    .controller('InitialDataController', InitialDataController);

  InitialDataController.$inject = ['usersService',
    'invitationService',
    'baseControllerClass',
    '$q',
    '$state',
    'ENV',
    'ncUtils'];

  function InitialDataController(
    usersService,
    invitationService,
    baseControllerClass,
    $q,
    $state,
    ENV,
    ncUtils) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      user: {},
      customer: {},
      project: {},
      currentProcess: null,
      invitation: {},
      getFilename: ncUtils.getFilename,

      init: function() {
        var fn = this._super.bind(this);
        var vm = this;
        if (!ENV.invitationsEnabled) {
          fn();
          vm.activate();
        } else {
          vm.checkInvitation().then(function(invitation) {
            vm.invitation = invitation;
            if (vm.invitation.state !== 'pending') {
              $state.go('errorPage.notFound');
            }
            fn();
            vm.activate();
          }, function() {
            $state.go('errorPage.notFound');
          });
        }
      },
      activate: function() {
        this.getUser();
      },
      getUser: function() {
        var vm = this;
        usersService.getCurrentUser().then(function(response) {
          vm.user = response;
          vm.user.email = vm.invitation ? vm.invitation.email : response.email;
        });
      },
      saveUser: function() {
        var vm = this;
        vm.currentProcess = 'Saving user...';
        return vm.user.$update(function() {
          usersService.currentUser = null;
        }, function(response) {
          vm.user.errors = response.data;
        });
      },
      gotoNextState: function () {
        if (!ENV.invitationsEnabled) {
          $state.go('profile.detail');
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
        if (!vm.user.email) {
          vm.user.errors = {email: 'This field is required'};
          return $q.reject();
        }
        if (!ENV.invitationsEnabled) {
          return vm.saveUser()
            .then(vm.gotoNextState.bind(vm));
        }
        return invitationService.accept(vm.invitation.uuid)
          .then(vm.saveUser.bind(vm))
          .then(vm.gotoNextState.bind(vm));
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();
