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
        this._super();
        this.activate();
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
        if (this.invitation && this.invitation.state === 'pending') {
          $state.go('dashboard.index');
        } else {
          $state.go('profile.detail');
        }
      },
      checkInvitation: function() {
        var vm = this;
        // TODO: XXX replace dummy code when back end data is ready
        vm.invitation =  {
          'project': 'https://rest-test.nodeconductor.com/api/projects/6f3ae6f43d284ca196afeb467880b3b9/',
          'project_role': 'admin',
          'customer': 'https://rest-test.nodeconductor.com/api/customers/bf6d515c9e6e445f9c339021b30fc96b/',
          'customer_role': 'owner',
          'state': 'pending'
        };

        var invitationUUID = $window.localStorage[ENV.invitationStorageToken];
        return invitationService.$get(invitationUUID).then(function(invitation) {
          vm.invitation = invitation;
        });
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
        return vm.checkInvitation().finally(function() {
          if (vm.invitation && vm.invitation.state === 'pending') {
            return vm.saveUser()
              .then(vm.saveCustomerPermission.bind(vm))
              .then(vm.saveProjectPermission.bind(vm))
              .then(vm.gotoNextState);
          }
          return vm.saveUser()
            .then(vm.gotoNextState);
        });
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();
