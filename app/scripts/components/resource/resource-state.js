import template from './resource-state.html';

export default function resourceState() {
  return {
    restrict: 'E',
    template: template,
    scope: {},
    bindToController: {
      resource: '='
    },
    controller: ResourceStateController,
    controllerAs: '$ctrl'
  };
}

// @ngInject
function ResourceStateController(resourceUtils) {
  this.context = resourceUtils.getResourceState(this.resource);
}
