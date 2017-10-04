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
      this.organizationSubnetsVisible = ENV.organizationSubnetsVisible;
      this.ownerCanManageCustomer = ENV.ownerCanManageCustomer;
      this.loadInitial();
    },
    loadInitial: function () {
      this.loading = true;
      return currentStateService.getCustomer().then((customer) => {
        this.customer = customer;
        return $q.all([
          this.getPaymentDetails(),
          this.loadCustomerPermissions(customer),
        ]).then(() => {
          if (this.paymentDetails) {
            this.accountingStartDate = this.paymentDetails.accounting_start_date;
          } else {
            this.accountingStartDate = this.customer.created;
          }
        });
      }).finally(() => {
        this.loading = false;
      });
    },
    loadCustomerPermissions: function(customer) {
      return this.getCustomerPermissions(customer).then((result) => {
        this.canDeleteCustomer = result.canDeleteCustomer;
        this.canUpdateCustomerPolicies = result.canUpdateCustomerPolicies;
        this.canRegisterExpertProvider = result.canRegisterExpertProvider;
        this.canUpdateQuota = result.canUpdateQuota;
      });
    },
    getPaymentDetails: function () {
      return paymentDetailsService.getList({
        customer_uuid: this.customer.uuid
      }).then((result) => {
        if (result) {
          this.paymentDetails = result[0];
        }
      });
    },
    getCustomerPermissions: function (customer) {
      return usersService.getCurrentUser().then((user) => {
        if (user.is_staff) {
          return $q.when({
            canDeleteCustomer: true,
            canUpdateCustomerPolicies: true,
            canRegisterExpertProvider: true,
            canUpdateQuota: true,
          });
        }
        for (let i = 0; i < customer.owners.length; i++) {
          if (user.uuid === customer.owners[i].uuid) {
            return $q.when({
              canDeleteCustomer: ENV.ownerCanManageCustomer,
              canUpdateCustomerPolicies: false,
              canRegisterExpertProvider: false,
              canUpdateQuota: false,
            });
          }
        }
        return $q.when(false);
      });
    },
    removeCustomer: function () {
      if (this.customer.projects.length > 0) {
        if (!features.isVisible('support')) {
          return ncUtilsFlash.error($filter('translate')(gettext('Organization contains projects. Please remove them first.')));
        }
        return $uibModal.open({
          component: 'issueCreateDialog',
          resolve: {
            issue: () => ({
              customer: this.customer,
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
        this.customer.$delete().then(() => {
          customersService.clearAllCacheForCurrentEndpoint();
          $state.go('profile.details');
        }, () => currentStateService.setCustomer(this.customer));
      }
    },
    reportError: function() {
      return $uibModal.open({
        component: 'customerReportError',
        resolve: () => ({customer: this.customer})
      });
    },
  });

  controllerScope.__proto__ = new ManageController();
}

