import template from './dialog.html';

export default function providerDetails() {
  return {
    restrict: 'E',
    template: template,
    controller: ProviderDetailsDialog,
    controllerAs: '$ctrl',
    scope: {},
    bindToController: {
      dismiss: '&',
      close: '&',
      resolve: '='
    }
  };
}

// @ngInject
function ProviderDetailsDialog($scope) {
  this.provider = this.resolve.provider;
}
