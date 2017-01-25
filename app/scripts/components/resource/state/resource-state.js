import template from './resource-state.html';

const resourceState = {
  template: template,
  bindings: {
    resource: '<'
  },
  controller: function ResourceStateController($scope, resourceStateService) {
    $scope.$watch(() => this.resource, () => {
      if (this.resource) {
        this.context = resourceStateService.getResourceState(this.resource);
      }
    });
  }
};

export default resourceState;
