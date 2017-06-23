import template from './price-tooltip.html';

const priceTooltip = {
  template,
  bindings: {
    estimated: '<',
  },
  controller: class PriceTooltipController {
    // @ngInject
    constructor(ENV) {
      // VAT is not included only when accounting mode is activated
      this.vatNotIncluded = ENV.accountingMode === 'accounting';
      this.message = this.getTooltipMessage();
    }

    getTooltipMessage() {
      const vatMessage = gettext('VAT is not included.');
      const estimatedMessage = gettext('Price is estimated.');
      let message = '';
      if (this.vatNotIncluded) {
        message += vatMessage;
      }
      if (this.estimated) {
        message += message ? ' ' + estimatedMessage : estimatedMessage;
      }

      return message;
    }
  }
};

export default priceTooltip;
