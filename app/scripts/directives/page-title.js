'use strict';

(function() {

  angular.module('ncsaas')
    .directive('pageTitle', ['$rootScope', '$timeout', 'ENV', pageTitle]);

  function pageTitle($rootScope, $timeout, ENV) {
    return {
      link: function(scope, element) {
        var listener = function(event, toState, toParams, fromState, fromParams) {
          var title = ENV.modePageTitle;
          if (toState.data && toState.data.pageTitle) {
            title = ENV.shortPageTitle + ' | ' + toState.data.pageTitle;
          }
          $timeout(function() {
            element.text(title);
          });
        };
        $rootScope.$on('$stateChangeStart', listener);
      }
    }
  }
})();

