import template from './contract-details-dialog.html';

const contractDetailsDialog = {
  template: template,
  bindings: {
    resolve: '<',
  },
  controller: class contractDetailsController {
    constructor($filter, premiumSupportPlansService, ENV, coreUtils) {
      // @ngInject
      this.$filter = $filter;
      this.premiumSupportPlansService = premiumSupportPlansService;
      this.ENV = ENV;
      this.coreUtils = coreUtils;
    }

    $onInit() {
      this.plan = null;
      this.dialogTitle = this.coreUtils.templateFormatter(
        gettext('"{planName}" details'),
        { planName: this.resolve.contract.plan_name });
      this.premiumSupportPlansService.$get(null, this.resolve.contract.plan).then((response) => {
        this.plan = {
          description: response.description,
          terms: response.terms,
          base_rate: this.$filter('currency')(response.base_rate, this.ENV.currency),
          hour_rate: this.$filter('currency')(response.hour_rate, this.ENV.currency)
        };
      });
    }
  }
};

export default contractDetailsDialog;
