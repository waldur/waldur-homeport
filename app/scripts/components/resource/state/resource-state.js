import template from './resource-state.html';

// @ngInject
function ResourceStateController($scope, resourceStateService) {
  $scope.$watch(() => this.resource, () => {
    if (this.resource) {
      this.context = resourceStateService.getResourceState(this.resource);
    }
  });
}

const resourceState = {
  template: template,
  bindings: {
    resource: '<'
  },
  controller: ResourceStateController
};

export default resourceState;
