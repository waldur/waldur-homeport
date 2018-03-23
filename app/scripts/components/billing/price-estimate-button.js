import template from './price-estimate-button.html';

export default {
  template,
  bindings: {
    customer: '<'
  },
  controller: class PriceEstimateButtonController {
    // @ngInject
    constructor($uibModal, PriceEstimateUtilsService) {
      this.$uibModal = $uibModal;
      this.PriceEstimateUtilsService = PriceEstimateUtilsService;
    }

    openPriceEstimateDialog() {
      return this.$uibModal.open({
        component: 'priceEstimateDialog',
        size: 'lg',
        resolve: {
          items: this.PriceEstimateUtilsService.loadInvoiceItems(this.customer.uuid),
        }
      });
    }
  }
};
