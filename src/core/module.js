import ErrorMessageFormatter from './ErrorMessageFormatter';
import loadingSpinner from './LoadingSpinner';
import sentryModule from './sentry';
import injectServices from './services';
import submitButton from './submit-button';

// @ngInject
function redirectToState($rootScope, $state, $injector) {
  $rootScope.$on('$stateChangeError', function (
    event,
    toState,
    toParams,
    fromState,
    fromParams,
    error,
  ) {
    // Erred state is terminal, user should not be redirected from erred state to login
    // so that he would be able to read error message details
    if (error && error.detail && error.detail.status === 401) {
      return $injector.get('authService').localLogout({
        toState: toState.name,
        toParams: JSON.parse(JSON.stringify(toParams)),
      });
    }
    if (error && error.redirectTo && error.status !== -1) {
      $state.go(error.redirectTo);
    } else {
      $state.go('errorPage.notFound');
    }
  });
}

// @ngInject
function scrollToTop($rootScope) {
  $rootScope.$on('$stateChangeSuccess', function () {
    document.scrollTop = 0;
    document.querySelector('#wrapper').scrollTop = 0;
  });
}

// @ngInject
function defaultErrorHandler($state) {
  // eslint-disable-next-line
  $state.defaultErrorHandler(function (error) {
    // Do not log transitionTo errors
  });
}

export default (module) => {
  module.service('ErrorMessageFormatter', ErrorMessageFormatter);
  module.directive('submitButton', submitButton);
  module.component('loadingSpinner', loadingSpinner);
  module.run(redirectToState);
  module.run(scrollToTop);
  module.run(injectServices);
  module.run(defaultErrorHandler);
  sentryModule(module);
};
