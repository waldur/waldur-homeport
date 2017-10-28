import template from './plans-list.html';
import './plans-list.scss';

const plansList = {
  template,
  controller: PlansListController,
  controllerAs: 'PlanList',
};

export default plansList;

// @ngInject
function PlansListController(
    baseControllerListClass, plansService, customersService, usersService, customerPermissionsService,
    agreementsService, ncUtils, $stateParams, $state, $window, $q) {
  let controllerScope = this;
  let Controller = baseControllerListClass.extend({
    init:function() {
      this.service = plansService;
      this.controllerScope = controllerScope;
      controllerScope.loading = true;
      this.loadInitial().finally(function() {
        controllerScope.loading = false;
      });
      this.selectedPlan = null;
      this.helpIconMessage = gettext('Both VMs and applications are counted as resources.');
    },

    loadInitial: function() {
      // check is current user - customer owner and load page if he is
      let vm = this;
      return usersService.getCurrentUser().then(function(user) {
        /*jshint camelcase: false */
        return customerPermissionsService.userHasCustomerRole(user.username, 'owner', $stateParams.uuid).then(
          function(hasRole) {
            vm.canSeePlans = hasRole;

            if (vm.canSeePlans || user.is_staff) {
              return $q.all([
                vm.getLimitsAndUsages(),
                vm.getList()
              ]);
            } else {
              $state.go('errorPage.notFound');
            }
          });
      });
    },

    getLimitsAndUsages: function() {
      let vm = this;
      return customersService.$get($stateParams.uuid).then(function(customer) {
        vm.customer = customer;
        vm.currentPlan = customer.plan;
        vm.usage = ncUtils.getQuotaUsage(customer.quotas);
      });
    },

    getPrettyQuotaName: ncUtils.getPrettyQuotaName,

    cancel: function() {
      $state.go('organization.details', {uuid: $stateParams.uuid});
    },

    selectPlan: function(plan) {
      if (!this.currentPlan || plan.url !== this.currentPlan.url) {
        this.selectedPlan = plan;
      } else {
        this.selectedPlan = null;
      }
    },

    createOrder: function() {
      let vm = this,
        order = agreementsService.$create();
      if (vm.selectedPlan !== null) {
        order.plan = vm.selectedPlan.url;
        order.customer = vm.customer.url;
        order.return_url = $state.href('agreement.approve', {}, {absolute: true});
        order.cancel_url = $state.href('agreement.cancel', {}, {absolute: true});

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
