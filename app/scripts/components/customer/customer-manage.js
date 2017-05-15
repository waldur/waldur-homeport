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
  ISSUE_IDS) {
  let controllerScope = this;
  let ManageController = baseControllerClass.extend({
    init: function () {
      this.controllerScope = controllerScope;
      this._super();
      this.paymentDetails = null;
      this.loadInitial();
    },
    loadInitial: function () {
      let vm = this;
      vm.loading = true;
      return currentStateService.getCustomer().then(function (customer) {
        vm.customer = customer;
        vm.getPaymentDetails();
        return vm.getCustomerPermissions(customer).then(function (result) {
          vm.canDeleteCustomer = result.canDeleteCustomer;
          vm.canUpdateCustomerPolicies = result.canUpdateCustomerPolicies;
        });
      }).finally(function () {
        vm.loading = false;
      });
    },
    getPaymentDetails: function () {
      let vm = this;
      paymentDetailsService.getList({
        customer_uuid: vm.customer.uuid
      }).then(function (result) {
        if (result) {
          vm.paymentDetails = result[0];
        }
      });
    },
    getCustomerPermissions: function (customer) {
      return usersService.getCurrentUser().then(function (user) {
        if (user.is_staff) {
          return $q.when({
            canDeleteCustomer: true,
            canUpdateCustomerPolicies: true
          });
        }
        for (let i = 0; i < customer.owners.length; i++) {
          if (user.uuid === customer.owners[i].uuid) {
            return $q.when({
              canDeleteCustomer: ENV.ownerCanDeleteCustomer,
              canUpdateCustomerPolicies: ENV.ownerCanUpdateCustomerPolicies
            });
          }
        }
        return $q.when(false);
      });
    },
    removeCustomer: function () {
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
        this.customer.$delete().then(function () {
          customersService.clearAllCacheForCurrentEndpoint();
          $state.go('profile.details');
        }, function () {
          currentStateService.setCustomer(vm.customer);
        });
      }
    },
  });

  controllerScope.__proto__ = new ManageController();
}

