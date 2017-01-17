// @ngInject
export default function providerUtils(ENV) {
  return {
    getProviderState: function(provider) {
      let context = {
        className: '',
        label: '',
        movementClassName: ''
      };
      context.label = provider.state;
      if (ENV.servicesStateColorClasses[provider.state] === 'processing') {
        context.movementClassName = 'progress-striped active';
      } else if (ENV.servicesStateColorClasses[provider.state] === 'erred') {
        context.className = 'progress-bar-danger';
      }
      return context;
    }
  };
}
