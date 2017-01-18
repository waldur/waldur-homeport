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
function ProviderStateController($scope, ENV) {
  $scope.$watch(() => this.provider, () =>
    this.context = getProviderState(this.provider)
  );

  function getProviderState(provider) {
    let context = {
      className: '',
      label: '',
      tooltip: '',
      movementClassName: ''
    };
    context.label = provider.state;

    if (ENV.servicesStateColorClasses[provider.state] === 'processing') {
      context.movementClassName = 'progress-striped active';
    } else if (ENV.servicesStateColorClasses[provider.state] === 'erred') {
      context.className = 'progress-bar-danger';
      context.tooltip = provider.error_message;
    }
    return context;
  }
}
