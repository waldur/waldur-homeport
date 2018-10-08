import template from './offering-policy.html';

const offeringPolicy = {
  template,
  bindings: {
    resolve: '<',
    dismiss: '&',
  },
  controller: class OfferingPolicy {
    $onInit() {
      this.terms_of_service = this.resolve.terms_of_service;
    }
  }
};

export default offeringPolicy;
