'use strict';

(function() {

  angular.module('ncsaas')
    .directive('visible', ['ENV', visible]);

  function visible(ENV) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        var doRemove = false,
          features = attrs.visible.split(',');
        for (var i = 0; i < features.length; i++) {
          if (ENV.toBeFeatures.indexOf(features[i].trim()) !== -1
              || (ENV.toBeFeatures.indexOf('resources') !== -1 && features[i].trim()) in ENV.resourcesTypes) {
            doRemove = true;
            break;
          }
        }
        if (!ENV.featuresVisible && doRemove) {
          element.remove();
        }
      }
    };
  }

})();
