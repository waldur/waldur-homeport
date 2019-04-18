import template from './customer-manage.html';
import DeleteCustomerAction from './customer-delete';

class CustomerManageController {
  // @ngInject
  constructor(
    customersService,
    invoicesService,
    usersService,
    currentStateService,
    stateUtilsService,
    features,
    ncUtilsFlash,
    $uibModal,
    $state,
    $q,
    $filter,
    $rootScope,
    ENV,
    ISSUE_IDS
  ) {
    this.customersService = customersService;
    this.invoicesService = invoicesService;
    this.usersService = usersService;
    this.currentStateService = currentStateService;
    this.features = features;
    this.ncUtilsFlash = ncUtilsFlash;
    this.$uibModal = $uibModal;
    this.$state = $state;
    this.$q = $q;
    this.$filter = $filter;
    this.$rootScope = $rootScope;
    this.ENV = ENV;
    this.ISSUE_IDS = ISSUE_IDS;
    this.organizationSubnetsVisible = ENV.organizationSubnetsVisible;
    this.stateUtilsService = stateUtilsService;
  }

  $onInit() {
    this.loadCustomer();
    this.$rootScope.$on('refreshCustomer', this.refreshCustomer.bind(this));
  }

  refreshCustomer() {
    this.customersService.refreshCurrentCustomer(this.customer.uuid).then(customer => this.customer = customer);
  }

  loadCustomer() {
    this.loading = true;
    return this.currentStateService.getCustomer().then((customer) => {
      this.customer = customer;
      return this.loadCustomerPermissions(customer);
    }).finally(() => {
      this.loading = false;
    });
  }

  loadCustomerPermissions(customer) {
    return this.getInvoices(customer).then(invoices => {
      return this.usersService.getCurrentUser().then(user => {
        const deleteAction = new DeleteCustomerAction(this.ENV, customer, user, invoices);
        this.canDeleteCustomer = deleteAction.hasPermission;
        this.deleteNeedsSupport = deleteAction.needsSupport;
        this.deleteNotification = deleteAction.notification;
        this.canUpdateCustomerPolicies = user.is_staff;
        this.canUpdateQuota = user.is_staff;
      });
    });
  }

  getInvoices(customer) {
    return this.invoicesService.getAll({
      customer_uuid: customer.uuid,
      field: ['state', 'price'],
    });
  }

  removeCustomer() {
    const translate = this.$filter('translate');

    if (this.deleteNeedsSupport) {
      if (!this.features.isVisible('support')) {
        return this.ncUtilsFlash.error(translate(this.deleteNotification));
      }
      return this.$uibModal.open({
        component: 'issueCreateDialog',
        resolve: {
          issue: () => ({
            customer: this.customer,
            type: this.ISSUE_IDS.CHANGE_REQUEST,
            summary: translate(gettext('Organization removal')),
          }),
          options: {
            title: gettext('Organization removal'),
            hideTitle: true,
            descriptionLabel: gettext('Reason'),
            descriptionPlaceholder: gettext('Why do you need to remove organization with existing projects?'),
            submitTitle: gettext('Request removal'),
          }
        }
      });
    }

    const confirmDelete = confirm(translate(gettext('Confirm deletion?')));
    if (confirmDelete) {
      this.currentStateService.setCustomer(null);
      this.customer.$delete().then(() => {
        this.customersService.clearAllCacheForCurrentEndpoint();
        this.$state.go('profile.details').then(() => {
          this.stateUtilsService.clear();
          this.currentStateService.setHasCustomer(false);
        });
      }, () => this.currentStateService.setCustomer(this.customer));
    }
  }

  reportError() {
    return this.$uibModal.open({
      component: 'customerReportError',
      resolve: () => ({customer: this.customer})
    });
  }
}

const customerManage = {
  template: template,
  controller: CustomerManageController,
};

export default customerManage;
