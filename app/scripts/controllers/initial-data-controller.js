'use strict';

(function() {

  angular.module('ncsaas')
    .controller('InitialDataController', InitialDataController);

  InitialDataController.$inject = ['usersService',
    'invitationService',
    'baseControllerClass',
    '$q',
    '$state',
    'ncUtils'];

  function InitialDataController(
    usersService,
    invitationService,
    baseControllerClass,
    $q,
    $state,
    ncUtils) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      user: {},
      customer: {},
      project: {},
      currentProcess: null,
      getFilename: ncUtils.getFilename,

      init: function() {
        var fn = this._super.bind(this);
        var vm = this;
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
      },
      activate: function() {
        this.getUser();
      },
      getUser: function() {
        var vm = this;
        usersService.getCurrentUser().then(function(response) {
          vm.user = response;
          vm.userCopy = angular.copy(response);
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
      gotoNextState: function() {
        if (this.invitation.customer) {
          $state.go('dashboard.index');
        } else if (!this.invitation.customer && !this.invitation.project) {
          $state.go('profile.detail');
        }
      },
      checkInvitation: function() {        
        return invitationService.$get(invitationService.getInvitationToken());
      },
      save: function() {
        var vm = this;
        var i;
        var requiredFields = {
          email: 'Email is required',
          full_name: 'Full name is required'
        };
        vm.user.errors = {};
        for (i in requiredFields) {
          if (requiredFields.hasOwnProperty(i) && !vm.user[i]) {
            vm.user.errors[i] = requiredFields[i];
          }
        }
        if (Object.keys(vm.user.errors).length !== 0) {
          return $q.reject();
        }

        return invitationService.accept(vm.invitation.uuid)
          .then(vm.saveUser.bind(vm))
          .then(vm.gotoNextState.bind(vm));
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();
