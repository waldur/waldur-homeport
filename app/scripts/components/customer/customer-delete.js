import template from './customer-delete.html';

const customerDelete = {
  template: template,
  controller: CustomerDeleteController,
  controllerAs: 'DeleteController',
};

export default customerDelete;

// @ngInject
function CustomerDeleteController(
  baseControllerClass,
  customersService,
  paymentDetailsService,
  usersService,
  currentStateService,
  $uibModal,
  $state,
  $q,
  $filter,
  ENV,
  ISSUE_IDS
) {
  var controllerScope = this;
  var DeleteController = baseControllerClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
      this.paymentDetails = null;
      this.loadInitial();
    },
    loadInitial: function() {
      var vm = this;
      vm.loading = true;
      return currentStateService.getCustomer().then(function(customer) {
        vm.customer = customer;
        vm.getPaymentDetails();
        return vm.checkCanRemoveCustomer(customer).then(function(result) {
          vm.canRemoveCustomer = result;
        });
      }).finally(function() {
        vm.loading = false;
      });
    },
    getPaymentDetails: function() {
      var vm = this;
      paymentDetailsService.getList({
        customer_uuid: vm.customer.uuid
      }).then(function(result) {
        if (result) {
          vm.paymentDetails = result[0];
        }
      });
    },
    checkCanRemoveCustomer: function(customer) {
      return usersService.getCurrentUser().then(function(user) {
        if (user.is_staff) {
          return $q.when(true);
        }
        for (var i = 0; i < customer.owners.length; i++) {
          if (user.uuid === customer.owners[i].uuid) {
            return $q.when(ENV.ownerCanManageCustomer);
          }
        }
        return $q.when(false);
      });
    },
    removeCustomer: function() {
      var vm = this;
      if (this.customer.projects.length > 0) {
        return $uibModal.open({
          component: 'issueCreateDialog',
          resolve: {
            issue: () => ({
              customer: vm.customer,
              type: ISSUE_IDS.CHANGE_REQUEST,
              summary: 'Organization removal'
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
      var confirmDelete = confirm($filter('translate')(gettext('Confirm deletion?')));
      if (confirmDelete) {
        currentStateService.setCustomer(null);
        this.customer.$delete().then(function() {
          customersService.clearAllCacheForCurrentEndpoint();
          $state.go('profile.details');
        }, function() {
          currentStateService.setCustomer(vm.customer);
        });
      }
    }
  });

  controllerScope.__proto__ = new DeleteController();
}

