import template from './billing-details.html';
import { WOKSPACE_NAMES } from '../navigation/workspace/constants';

const billingDetails = {
  template,
  controller: class BillingDetailsController {
    // @ngInject
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
      paypalInvoicesService,
      features,
      titleService,
      BillingUtils) {
      this.ENV = ENV;
      this.$state = $state;
      this.$stateParams = $stateParams;
      this.WorkspaceService = WorkspaceService;
      this.currentStateService = currentStateService;
      this.customersService = customersService;
      this.usersService = usersService;
      this.ncUtils = ncUtils;
      this.titleService = titleService;
      this.BillingUtils = BillingUtils;
      this.features = features;
      this.invoicesService = invoicesService;
      this.paypalInvoicesService = paypalInvoicesService;
    }

    $onInit() {
      this.paypalVisible = this.features.isVisible('paypal');
      this.showAccountingRecords = this.ENV.accountingMode === 'accounting';
      this.invoice = {};
      this.loading = true;
      this.loadInvoice().finally(() => this.loading = false);
      this.titleService.setTitle(this.BillingUtils.getPageTitle());
    }

    loadInvoice() {
      return this.getInvoiceService().$get(this.$stateParams.uuid).then(invoice => {
        this.invoice = angular.extend({
          period: this.BillingUtils.formatPeriod(invoice),
          items: invoice.items},
          invoice,
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
          workspace: WOKSPACE_NAMES.organization,
        });

        return this.usersService.getCurrentUser().then(currentUser => {
          const status = this.customersService.checkCustomerUser(currentCustomer, currentUser);
          this.currentStateService.setOwnerOrStaff(status);
          this.currentStateService.setCustomer(currentCustomer);
        });
      })
      .catch(() => {
        this.$state.go('errorPage.notFound');
      });
    }

    getInvoiceService() {
      if (!this.showAccountingRecords && this.paypalVisible) {
        return this.paypalInvoicesService;
      } else {
        return this.invoicesService;
      }
    }
  }
};

export default billingDetails;
