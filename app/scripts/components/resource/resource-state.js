import template from './resource-state.html';

const resourceState = {
  template: template,
  bindings: {
    resource: '<'
  },
  controller: function ResourceStateController($scope, resourceUtils) {
    $scope.$watch(() => this.resource, () =>
      this.context = resourceUtils.getResourceState(this.resource));
  }
};

export default resourceState;
