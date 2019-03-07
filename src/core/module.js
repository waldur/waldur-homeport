import ErrorMessageFormatter from './ErrorMessageFormatter';
import submitButton from './submit-button';
import loadingSpinner from './LoadingSpinner';
import messageDialog from './MessageDialog';
import multipleSelect from './multiple-select';
import sentryModule from './sentry';
import { baseServiceClass, listCache } from './base-service';
import servicesService from './services-service';
import tabCounterService from './tab-counters-service';
import ncUtils from './ncUtils';
import extensionPoint from './extension-point-directive';
import extensionPointService from './extension-point-service';
import injectServices from './services';
import { translate } from '../i18n/translate';

export default module => {
  module.service('coreUtils', () => ({templateFormatter: translate}));
  module.service('ErrorMessageFormatter', ErrorMessageFormatter);
  module.service('ncUtils', ncUtils);
  module.service('baseServiceClass', baseServiceClass);
  module.factory('listCache', listCache);
  module.service('servicesService', servicesService);
  module.service('tabCounterService', tabCounterService);
  module.directive('submitButton', submitButton);
  module.component('loadingSpinner', loadingSpinner);
  module.component('messageDialog', messageDialog);
  module.directive('multipleSelect', multipleSelect);
  module.directive('extensionPoint', extensionPoint);
  module.service('extensionPointService', extensionPointService);
  module.run(redirectToState);
  module.run(scrollToTop);
  module.run(injectServices);
  sentryModule(module);
};

// @ngInject
function redirectToState($rootScope, $state, $injector) {
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    if (error) {
      // eslint-disable-next-line no-console
      console.log('$stateChangeError', error);
    }
    // Erred state is terminal, user should not be redirected from erred state to login
    // so that he would be able to read error message details
    if (error && error.status === 401 && (!$state.current.data || !$state.current.data.erred)) {
      return $injector.get('authService').localLogout();
    }
    if (error && error.redirectTo && error.status !== -1) {
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
