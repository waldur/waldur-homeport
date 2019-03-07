import { translate } from '@waldur/i18n';

import template from './appstore-offering-summary.html';

const appstoreOfferingSummary = {
  template,
  bindings: {
    model: '<',
  },
  controller: class {
    // @ngInject
    constructor(currentStateService, $q) {
      this.currentStateService = currentStateService;
      this.$q = $q;
    }

    $onInit() {
      this.loading = true;
      this.$q.all([
        this.currentStateService.getCustomer().then(customer => {
          this.customer = customer;
        }),
        this.currentStateService.getProject().then(project => {
          this.project = project;
        }),
      ]).finally(() => this.loading = false);
    }

    getPriceLabel() {
      if (this.model.lower_price) {
        return translate('Price per month from');
      } else {
        return translate('Price per month');
      }
    }
  }
};

export default appstoreOfferingSummary;
