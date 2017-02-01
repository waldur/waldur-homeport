import ErrorMessageFormatter from './error-message-formatter';
import attachTracking from './tracking';
import submitButton from './submit-button';
import sentryModule from './sentry';

export default module => {
  module.service('ErrorMessageFormatter', ErrorMessageFormatter);
  module.run(attachTracking);
  module.directive('submitButton', submitButton);
  module.run(redirectToState);
  sentryModule(module);
};

// @ngInject
function redirectToState($rootScope, $state) {
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    if (error && error.redirectTo) {
      $state.go(error.redirectTo);
    } else {
      $state.go('errorPage.notFound');
    }
  });
}
