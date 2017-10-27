import template from './resource-details.html';

const resourceDetails = {
  template,
  bindings: {
    resource: '<',
    controller: '<',
  },
  controller: class {
    // @ngInject
    constructor(resourceUtils) {
      this.resourceUtils = resourceUtils;
    }
    $onInit() {
      this.header = this.resourceUtils.formatResourceType(this.resource);
    }
  }
};

export default resourceDetails;
