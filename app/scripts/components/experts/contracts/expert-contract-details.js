import template from './expert-contract-details.html';

const expertContractDetails = {
  template,
  bindings: {
    resolve: '<',
    dismiss: '&',
  },
  controller: class {
    $onInit() {
      this.expertRequest = this.resolve.expertRequest;
      if (!this.expertRequest.type && this.resolve.requestType) {
        this.expertRequest.type = this.resolve.requestType;
      }
    }
  }
};

export default expertContractDetails;
