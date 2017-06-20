import template from './vat-tooltip.html';

const vatTooltip = {
  template,
  controller: class VATTooltipController {
    // @ngInject
    constructor(ENV) {
      // we show highlights only when accounting mode is activated
      this.showTooltip = ENV.accountingMode == 'accounting';
    }
  }
};

export default vatTooltip;
