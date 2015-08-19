'use strict';

(function() {

  angular.module('ncsaas')
    .directive('visible', ['ENV', visible]);

  function visible(ENV) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        if (!ENV.featuresVisible && ENV.toBeFeatures.indexOf(attrs.visible) !== -1) {
          element.remove();
        }
      }
    };
  }

})();
