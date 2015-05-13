'use strict';

(function() {
  angular.module('ncsaas')
    .controller('PlansListController',
      ['baseControllerListClass', 'plansService', 'customersService', 'usersService', 'customerPermissionsService',
       'planCustomersService', 'ordersService', '$stateParams', '$state', PlansListController]);

  function PlansListController(
      baseControllerListClass, plansService, customersService, usersService, customerPermissionsService,
      planCustomersService, ordersService, $stateParams, $state) {
    var controllerScope = this;
    var Controller = baseControllerListClass.extend({
      init:function() {
        this.service = plansService;
        this.controllerScope = controllerScope;
        this.checkPermissions();
        this.selectedPlan = null;
      },

      initCurrentPlan: function(customer) {
        var vm = this;
        planCustomersService.getList({customer: customer.uuid}).then(function(planCustomers) {
          if (planCustomers.length !== 0) {
            vm.currentPlan = planCustomers[0].plan;
          }
        });
      },

      checkPermissions: function() {
        // check is current user - customer owner and load page if he is
        var vm = this;
        usersService.getCurrentUser().then(function(user) {
          /*jshint camelcase: false */
          customerPermissionsService.userHasCustomerRole(user.username, 'owner', $stateParams.uuid).then(
            function(hasRole) {
              vm.canSeePlans = hasRole;

              if (vm.canSeePlans || user.is_staff) {
                customersService.getCustomer($stateParams.uuid).$promise.then(function(customer) {
                  vm.customer = customer;
                  vm.initCurrentPlan(customer);
                });
                vm.getList();
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
      },

      selectPlan: function(plan) {
        console.log('selected: ' + plan.name);
        if (!this.currentPlan || plan.uuid !== this.currentPlan.uuid) {
          this.selectedPlan = plan;
        } else {
          this.selectedPlan = null;
        }
      },

      createOrder: function() {
        var vm = this,
          order = ordersService.$create();
        if (vm.selectedPlan !== null) {
          order.plan = vm.selectedPlan.url;
          order.customer = vm.customer.url;
          order.$save(function(order) {
            // XXX: we are going to mock page, this should be rewritten after payment system implementation\
            $state.go('payment.mock', {uuid:order.uuid});
          });
        }
      }

    });

    controllerScope.__proto__ = new Controller();
  }

})();