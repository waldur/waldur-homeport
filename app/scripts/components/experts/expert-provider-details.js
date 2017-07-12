import template from './expert-provider-details.html';

const expertProviderDetails = {
  template,
  bindings: {
    customer: '<',
  },
  controller: class ExpertProviderDetailsController {
    // @ngInject
    constructor(expertsService, ncUtilsFlash) {
      this.expertsService = expertsService;
      this.ncUtilsFlash = ncUtilsFlash;
    }

    $onInit() {
      this.loading = true;
      this.loadExpertProvider().finally(() => {
        this.loading = false;
      });
    }

    loadExpertProvider() {
      return this.expertsService.getByCustomer(this.customer).then(result => {
        this.expertProvider = result.data[0];
      });
    }

    register() {
      return this.expertsService.register(this.customer, this.agree_with_policy).then((response) => {
        this.expertProvider = response.data;
        this.ncUtilsFlash.success(gettext('Expert provider has been registered'));
      });
    }
  }
};

export default expertProviderDetails;
