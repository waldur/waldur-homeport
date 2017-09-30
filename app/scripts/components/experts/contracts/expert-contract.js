import template from './expert-contract.html';

const expertContract = {
  template,
  bindings: {
    model: '<',
  },
  controller: class {
    // @ngInject
    constructor(expertRequestsService) {
      this.expertRequestsService = expertRequestsService;
    }

    $onInit() {
      this.loading = true;
      this.expertRequestsService.getConfiguration().then(config => {
        this.contractTemplate = config;
        this.offeringConfig = this.contractTemplate.offerings[this.model.type];
      }).finally(() => {
        this.loading = false;
      });
    }
  }
};

export default expertContract;
