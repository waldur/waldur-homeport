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
    'blockUI',
    'ncUtils'];

  function InitialDataController(
    usersService,
    invitationService,
    baseControllerClass,
    $q,
    $state,
    ENV,
    blockUI,
    ncUtils) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      user: {},
      customer: {},
      project: {},
      currentProcess: null,
      invitation: {},
      getFilename: ncUtils.getFilename,
      pageTitle: ENV.shortPageTitle,

      init: function() {
        var fn = this._super.bind(this);
        var vm = this;
        this.loading = true;
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
        this.block = blockUI.instances.get('initial-data-block');
        this.block.start({delay: 0});
        this.getUser();
      },
      getUser: function() {
        var vm = this;
        usersService.getCurrentUser().then(function(response) {
          vm.block.stop();
          vm.loading = false;
          vm.user = response;
          vm.user.email = vm.invitation && vm.invitation.email ? vm.invitation.email : response.email;
          vm.user.registration_method = (vm.user.registration_method && vm.user.registration_method === 'openid') ?
            'Estonian ID' :
            vm.user.registration_method[0].toUpperCase() + vm.user.registration_method.slice(1);
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
