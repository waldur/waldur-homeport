import template from './resource-details.html';

const resourceDetails = {
  template,
  bindings: {
    resource: '<',
    controller: '<',
  },
  controller: class {
    constructor(resourceUtils) {
      // @ngInject
      this.resourceUtils = resourceUtils;
    }
    $onInit() {
      this.header = this.resourceUtils.formatResourceType(this.resource);
    }
  }
};

export default resourceDetails;
