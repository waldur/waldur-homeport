'use strict';

(function() {

  angular.module('ncsaas')
    .controller('InitialDataController', InitialDataController);

  InitialDataController.$inject = ['usersService',
    'invitationService',
    'projectPermissionsService',
    'customerPermissionsService',
    'baseControllerClass',
    'ENV',
    '$q',
    '$state',
    '$window',
    'ncUtils'];

  function InitialDataController(
    usersService,
    invitationService,
    projectPermissionsService,
    customerPermissionsService,
    baseControllerClass,
    ENV,
    $q,
    $state,
    $window,
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
        var invitationValid = this.invitation && this.invitation.state === 'pending';
        if (invitationValid) {
          $state.go('dashboard.index');
        } else if (invitationValid && !this.invitation.customer && !this.invitation.project) {
          $state.go('profile.detail');
        }
      },
      checkInvitation: function() {
        var invitationUUID = $window.localStorage[ENV.invitationStorageToken];
        return invitationService.$get(invitationUUID);
      },
      saveCustomerPermission: function() {
        var vm = this;
        var permission = customerPermissionsService.$create();
        permission.user = vm.user.url;
        permission.customer = vm.invitation.customer;
        permission.role = vm.invitation.customer_role;
        return permission.$save();
      },
      saveProjectPermission: function() {
        var vm = this;
        var instance = projectPermissionsService.$create();
        instance.user = vm.user.url;
        instance.project = vm.invitation.project;
        instance.role = vm.invitation.project_role;
        return instance.$save();
      },
      save: function() {
        var vm = this;
        if (!vm.user.email) {
          vm.user.errors = {email: 'This field is required'};
          return $q.reject();
        }
        if (vm.invitation && vm.invitation.state === 'pending') {
          return vm.saveUser()
            .then(vm.saveCustomerPermission.bind(vm))
            .then(vm.saveProjectPermission.bind(vm))
            .then(vm.gotoNextState);
        }
        return vm.saveUser()
          .then(vm.gotoNextState);
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();
