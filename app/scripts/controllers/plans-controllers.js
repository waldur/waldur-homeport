'use strict';

(function() {
  angular.module('ncsaas')
    .controller('PlansListController',
      ['baseControllerListClass', 'plansService', 'customersService', 'usersService', 'customerPermissionsService',
       'agreementsService', '$stateParams', '$state', '$window', '$q', PlansListController]);

  function PlansListController(
      baseControllerListClass, plansService, customersService, usersService, customerPermissionsService,
      agreementsService, $stateParams, $state, $window, $q) {
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
        customersService.getCurrentPlan(customer).then(function(response) {
          vm.currentPlan = response.plan;
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
                customersService.$get($stateParams.uuid).then(function(customer) {
                  vm.customer = customer;
                  vm.initCurrentPlan(customer);
                });
                vm.getList();
              } else {
                $state.go('errorPage.notFound');
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
        $state.go('organizations.details', {uuid:$stateParams.uuid});
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
        if (!this.currentPlan || plan.url !== this.currentPlan) {
          this.selectedPlan = plan;
        } else {
          this.selectedPlan = null;
        }
      },

      createOrder: function() {
        var vm = this,
          order = agreementsService.$create();
        if (vm.selectedPlan !== null) {
          order.plan = vm.selectedPlan.url;
          order.customer = vm.customer.url;
          return order.$save(function(order) {
            customersService.clearAllCacheForCurrentEndpoint();
            $window.location = order.approval_url;
            return true;
          });
        }
        return $q.reject();
      }

    });

    controllerScope.__proto__ = new Controller();
  }

})();
