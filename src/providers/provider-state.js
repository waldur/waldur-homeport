import template from './provider-state.html';

const providerState = {
  template: template,
  bindings: {
    provider: '<'
  },
  controller: ProviderStateController,
};

export default providerState;

/* eslint-disable quote-props */
const SERVICE_STATES = {
  'OK': 'online',
  'Erred': 'erred',
  'In Sync': 'online',
  'Creation Scheduled': 'processing',
  'Creating': 'processing',
  'Update Scheduled': 'processing',
  'Updating': 'processing',
  'Deletion Scheduled': 'processing',
  'Deleting': 'processing'
};
/* eslint-enable quote-props */

// @ngInject
function ProviderStateController($scope) {
  $scope.$watch(() => this.provider, () =>
    this.context = getProviderState(this.provider)
  );

  function getProviderState(provider) {
    let providerState;

    if (provider) {
      providerState = provider.state;
    }

    let context = {
      className: '',
      label: providerState || 'N/A',
      tooltip: '',
      movementClassName: ''
    };

    const cls = SERVICE_STATES[providerState] || 'erred';

    if (cls === 'processing') {
      context.movementClassName = 'progress-striped active';
    } else if (cls === 'erred') {
      context.className = 'progress-bar-danger';
      if (provider && provider.tooltip) {
        context.tooltip = provider.error_message;
      }
    }

    return context;
  }
}
