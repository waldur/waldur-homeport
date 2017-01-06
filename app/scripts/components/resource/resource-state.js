import template from './resource-state.html';

const resourceState = {
  template: template,
  bindings: {
    resource: '<'
  },
  controller: ResourceStateController,
};

export default resourceState;

// @ngInject
function ResourceStateController(resourceUtils, $scope) {
  $scope.$watch(() => this.resource, () =>
    this.context = resourceUtils.getResourceState(this.resource)
  );
}
