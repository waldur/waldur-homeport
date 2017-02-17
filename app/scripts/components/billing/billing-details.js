import template from './billing-details.html';

const billingDetails = {
  template,
  controller: class {
    constructor(
      ENV,
      $state,
      $stateParams,
      WorkspaceService,
      currentStateService,
      customersService,
      usersService,
      ncUtils,
      invoicesService,
      titleService,
      BillingUtils) {
      // @ngInject
      this.ENV = ENV;
      this.$state = $state;
      this.$stateParams = $stateParams;
      this.WorkspaceService = WorkspaceService;
      this.currentStateService = currentStateService;
      this.customersService = customersService;
      this.usersService = usersService;
      this.ncUtils = ncUtils;
      this.invoicesService = invoicesService;
      this.titleService = titleService;
      this.BillingUtils = BillingUtils;
    }

    $onInit() {
      this.showAccountingRecords = this.ENV.accountingMode === 'accounting';
      this.invoice = {};
      this.loading = true;
      this.loadInvoice().finally(() => this.loading = false);
      this.titleService.setTitle(this.BillingUtils.getPageTitle());
    }

    loadInvoice() {
      return this.invoicesService.$get(this.$stateParams.uuid).then(invoice => {
        this.invoice = angular.extend({
          period: this.BillingUtils.formatPeriod(invoice)},
          invoice
        );
        return invoice;
      })
      .then(invoice => {
        const customer_uuid = this.ncUtils.getUUID(invoice.customer);
        return this.customersService.$get(customer_uuid);
      })
      .then(currentCustomer => {
        this.WorkspaceService.setWorkspace({
          customer: currentCustomer,
          project: null,
          hasCustomer: true,
          workspace: 'organization',
        });

        return this.usersService.getCurrentUser().then(currentUser => {
          const status = this.customersService.checkCustomerUser(currentCustomer, currentUser);
          this.currentStateService.setOwnerOrStaff(status);
          this.currentStateService.setCustomer(currentCustomer);
        });
      })
      .catch(response => {
        this.$state.go('errorPage.notFound');
      });
    }
  }
};

export default billingDetails;
