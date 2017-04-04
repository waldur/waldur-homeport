import template from './resource-name.html';

const resourceName = {
  template,
  bindings: {
    resource: '<'
  },
  controller: class ResourceName {
    constructor(resourceUtils) {
      // @ngInject
      this.resourceUtils = resourceUtils;
    }

    $onInit() {
      this.resourceIcon = this.resourceUtils.getIcon(this.resource);
      this.resourceType = this.resourceUtils.formatResourceType(this.resource.resource_type);
    }
  }
};

export default resourceName;
