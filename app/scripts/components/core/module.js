import ErrorMessageFormatter from './error-message-formatter';
import attachTracking from './tracking';
import submitButton from './submit-button';
import loadingSpinner from './loading-spinner';
import sentryModule from './sentry';

export default module => {
  module.service('ErrorMessageFormatter', ErrorMessageFormatter);
  module.run(attachTracking);
  module.directive('submitButton', submitButton);
  module.component('loadingSpinner', loadingSpinner);
  module.run(redirectToState);
  module.run(scrollToTop);
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

// @ngInject
function scrollToTop($rootScope, $document) {
  $rootScope.$on('$stateChangeSuccess', function() {
    $document.scrollTop(0);
    $('#wrapper').scrollTop(0);
  });
}
