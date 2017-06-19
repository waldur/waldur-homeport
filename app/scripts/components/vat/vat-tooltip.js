import template from './vat-tooltip.html';

const vatTooltip = {
  template,
  controller: class VATTooltipController {
    // @ngInject
    constructor(ENV) {
      this.showTooltip = ENV.pricesWithVAT;
    }
  }
};

export default vatTooltip;
