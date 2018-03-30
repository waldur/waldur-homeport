import * as registry from './resource-configuration';
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
      const config = registry.get(this.resource.resource_type);
      if (config) {
        this.header = config.getHeader(this.resource);
        return;
      }
      this.header = this.resourceUtils.formatResourceType(this.resource);
    }
  }
};

export default resourceDetails;
