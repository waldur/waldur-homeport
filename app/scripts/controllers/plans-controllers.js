'use strict';

(function() {
  angular.module('ncsaas')
    .controller('PlansListController',
      ['baseControllerListClass', 'plansService', 'customersService', 'usersService', 'customerPermissionsService',
       '$stateParams', '$state', PlansListController]);

  function PlansListController(
      baseControllerListClass, plansService, customersService, usersService, customerPermissionsService,
      $stateParams, $state) {
    var controllerScope = this;
    var Controller = baseControllerListClass.extend({
      init:function() {
        this.service = plansService;
        this.controllerScope = controllerScope;
        this.checkPermissions();
      },

      checkPermissions: function() {
        // check is current user - customer owner and load page if he is
        var vm = this;
        usersService.getCurrentUser().then(function(user) {
          /*jshint camelcase: false */
          customerPermissionsService.userHasCustomerRole(user.username, 'owner').then(function(hasRole) {
            vm.canSeePlans = hasRole;

            if (vm.canSeePlans || user.is_staff) {
              // XXX: backend does not give information about selected plan. so we can not activate one yet.
              // Activation has to be added here and in signal later.
              vm.getList();
              vm.customer = customersService.getCustomer($stateParams.uuid);
            } else {
              $state.go('pageNotFound');
            }
          });
        });
      },

      // XXX: This is quick fix, we need to get display names from backend, but currently quotas on backend do not
      // have display names
      getPrettyQuotaName: function(name) {
        var prettyNames = {
          'nc_user_count': 'users',
          'nc_resource_count': 'resources',
          'nc_project_count': 'projects'
        };
        return prettyNames[name];
      },

      cancel: function() {
        $state.go('customers.details', {uuid:$stateParams.uuid});
      },

      initCustomerOwnership: function() {
        var vm = this;
        usersService.getCurrentUser().then(function(user) {
          /*jshint camelcase: false */
          if (user.is_staff) {
            vm.canSeePlans = true;
          }
          customerPermissionsService.userHasCustomerRole(user.username, 'owner').then(function(hasRole) {
            vm.canSeePlans = hasRole;
          });
        });
      }

    });

    controllerScope.__proto__ = new Controller();
  }

})();