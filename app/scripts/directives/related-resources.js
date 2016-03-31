'use strict';

(function() {

  angular.module('ncsaas')
    .directive('relatedResources', [relatedResources]);

  function relatedResources() {
    return {
      restrict: 'E',
      scope: {
        'resource': '='
      },
      templateUrl: 'views/directives/related-resources.html'
    };
  }
})();
