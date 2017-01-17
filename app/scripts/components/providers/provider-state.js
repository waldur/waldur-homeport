import template from './provider-state.html';

const providerState = {
  template: template,
  bindings: {
    provider: '<'
  },
  controller: ProviderStateController,
};

export default providerState;

// @ngInject
function ProviderStateController(providerUtils, $scope) {
  $scope.$watch(() => this.provider, () =>
    this.context = providerUtils.getProviderState(this.provider)
  );
}
