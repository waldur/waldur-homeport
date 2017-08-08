import ErrorMessageFormatter from './error-message-formatter';
import submitButton from './submit-button';
import loadingSpinner from './LoadingSpinner';
import multipleSelect from './multiple-select';
import sentryModule from './sentry';
import { baseServiceClass, listCache } from './base-service';
import servicesService from './services-service';
import tabCounterService from './tab-counters-service';
import { ncUtils, coreUtils } from './utils';
import extensionPoint from './extension-point-directive';
import extensionPointService from './extension-point-service';

export default module => {
  module.service('ErrorMessageFormatter', ErrorMessageFormatter);
  module.service('ncUtils', ncUtils);
  module.service('coreUtils', coreUtils);
  module.service('baseServiceClass', baseServiceClass);
  module.factory('listCache', listCache);
  module.service('servicesService', servicesService);
  module.service('tabCounterService', tabCounterService);
  module.directive('submitButton', submitButton);
  module.component('loadingSpinner', loadingSpinner);
  module.directive('multipleSelect', multipleSelect);
  module.directive('extensionPoint', extensionPoint);
  module.service('extensionPointService', extensionPointService);
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
