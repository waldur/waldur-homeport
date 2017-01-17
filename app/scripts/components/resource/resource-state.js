import template from './resource-state.html';

const resourceState = {
  template: template,
  bindings: {
    resource: '<'
  },
  controller: class ResourceStateController {
    constructor(resourceUtils) {
      // @ngInject
      this.resourceUtils = resourceUtils;
    }

    $onInit() {
      this.refresh();
    }

    $onChange() {
      this.refresh();
    }

    refresh() {
      this.context = this.resourceUtils.getResourceState(this.resource);
    }
  }
};

export default resourceState;
