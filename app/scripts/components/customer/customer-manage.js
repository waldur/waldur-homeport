import template from './customer-manage.html';

const customerManage = {
  template: template,
  controller: CustomerManageController,
  controllerAs: 'ManageController',
};

export default customerManage;

// @ngInject
function CustomerManageController(
  baseControllerClass,
  customersService,
  priceEstimatesService,
  paymentDetailsService,
  usersService,
  currentStateService,
  features,
  ncUtilsFlash,
  $uibModal,
  $state,
  $q,
  $filter,
  ENV,
  ISSUE_IDS
) {
  let controllerScope = this;
  let ManageController = baseControllerClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
      this.paymentDetails = null;
      this.loadInitial();
      this.currency = ENV.currency;
    },
    loadInitial: function() {
      let vm = this;
      vm.loading = true;
      return currentStateService.getCustomer().then(function(customer) {
        vm.customer = customer;
        vm.isHardLimit = vm.checkIsHardLimit(vm.customer.price_estimate);
        vm.getPaymentDetails();
        return vm.checkCanManageCustomer(customer).then(function(result) {
          vm.canManageCustomer = result;
        });
      }).finally(function() {
        vm.loading = false;
      });
    },
    getPaymentDetails: function() {
      let vm = this;
      paymentDetailsService.getList({
        customer_uuid: vm.customer.uuid
      }).then(function(result) {
        if (result) {
          vm.paymentDetails = result[0];
        }
      });
    },
    checkCanManageCustomer: function(customer) {
      return usersService.getCurrentUser().then(function(user) {
        if (user.is_staff) {
          return $q.when(true);
        }
        for (let i = 0; i < customer.owners.length; i++) {
          if (user.uuid === customer.owners[i].uuid) {
            return $q.when(ENV.ownerCanManageCustomer);
          }
        }
        return $q.when(false);
      });
    },
    removeCustomer: function() {
      let vm = this;
      if (this.customer.projects.length > 0) {
        if (!features.isVisible('support')) {
          return ncUtilsFlash.error($filter('translate')(gettext('Organization contains projects. Please remove them first.')));
        }
        return $uibModal.open({
          component: 'issueCreateDialog',
          resolve: {
            issue: () => ({
              customer: vm.customer,
              type: ISSUE_IDS.CHANGE_REQUEST,
              summary: gettext('Organization removal'),
            }),
            options: {
              title: gettext('Organization removal'),
              hideTitle: true,
              descriptionLabel: gettext('Reason'),
              descriptionPlaceholder: gettext('Why do you need to remove organization with existing projects?'),
              submitTitle: gettext('Request removal')
            }
          }
        });
      }
      let confirmDelete = confirm($filter('translate')(gettext('Confirm deletion?')));
      if (confirmDelete) {
        currentStateService.setCustomer(null);
        this.customer.$delete().then(function() {
          customersService.clearAllCacheForCurrentEndpoint();
          $state.go('profile.details');
        }, function() {
          currentStateService.setCustomer(vm.customer);
        });
      }
    },
    checkIsHardLimit(estimate) {
      return estimate.limit > 0 && estimate.limit === estimate.threshold;
    },
    updatePolicies: function() {
      const promises = [
        this.saveLimit(),
        this.saveThreshold(),
      ];

      return $q.all(promises).then(() => {
        ncUtilsFlash.success(gettext('Organization policies have been updated.'));
      }).catch((response) => {
        if (response.status === 400) {
          for (let name in response.data) {
            let message = response.data[name];
            ncUtilsFlash.error(message);
          }
        } else {
          ncUtilsFlash.error(gettext('An error occurred on policies update.'));
        }
      });
    },
    saveLimit() {
      const limit = this.isHardLimit ? this.customer.price_estimate.threshold : -1;
      return priceEstimatesService.setLimit(this.customer.url, limit);
    },
    saveThreshold(){
      return priceEstimatesService.setThreshold(this.customer.url, this.customer.price_estimate.threshold);
    },
    validateThreshold() {
      let isValid = this.customer.price_estimate.threshold > this.customer.price_estimate.total;
      this.policiesForm.threshold.$setValidity('exceedsThreshold', isValid);
    }
  });

  controllerScope.__proto__ = new ManageController();
}

