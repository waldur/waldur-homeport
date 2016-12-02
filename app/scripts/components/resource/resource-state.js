import template from './resource-state.html';

export default function resourceState(resourceUtils) {
  return {
    restrict: 'E',
    template: template,
    scope: {},
    bindToController: {
      resource: '='
    },
    controller: function () {
      this.editedResourceState = resourceUtils.getResourceState(this.resource);
    },
    controllerAs: '$ctrl'
  };
}
