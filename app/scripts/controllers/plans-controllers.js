'use strict';

(function() {
  angular.module('ncsaas')
    .controller('PlansListController',
      ['baseControllerListClass', 'plansService', 'customersService', 'usersService', 'customerPermissionsService',
       'agreementsService', 'ncUtils', '$stateParams', '$state', '$window', '$q', PlansListController]);

  function PlansListController(
      baseControllerListClass, plansService, customersService, usersService, customerPermissionsService,
      agreementsService, ncUtils, $stateParams, $state, $window, $q) {
    var controllerScope = this;
    var Controller = baseControllerListClass.extend({
      init:function() {
        this.service = plansService;
        this.controllerScope = controllerScope;
        this.checkPermissions();
        this.selectedPlan = null;
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
                vm.getLimitsAndUsages();
                vm.getList();
              } else {
                $state.go('errorPage.notFound');
              }
            });
        });
      },

      getLimitsAndUsages: function() {
        var vm = this;
        return customersService.$get($stateParams.uuid).then(function(customer) {
          vm.customer = customer;
          vm.currentPlan = customer.plan;
          vm.usage = {};
          for (var i = 0; i < customer.quotas.length; i++) {
            var item = customer.quotas[i];
            vm.usage[item.name] = item.usage;
          }
        });
      },

      getPrettyQuotaName: ncUtils.getPrettyQuotaName,

      cancel: function() {
        $state.go('organizations.details', {uuid:$stateParams.uuid});
      },

      selectPlan: function(plan) {
        if (!this.currentPlan || plan.url !== this.currentPlan.url) {
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
