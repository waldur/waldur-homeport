import template from './resource-name.html';

const resourceName = {
  template,
  bindings: {
    resource: '<'
  },
  controller: class ResourceName {
    // @ngInject
    constructor(resourceUtils) {
      this.resourceUtils = resourceUtils;
    }

    $onInit() {
      this.resourceIcon = this.resourceUtils.getIcon(this.resource);
      this.resourceType = this.resourceUtils.formatResourceType(this.resource);
    }
  }
};

export default resourceName;
