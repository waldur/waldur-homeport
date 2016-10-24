'use strict';

(function() {

  angular.module('ncsaas')
    .directive('visible', ['ENV', '$parse', visible]);

  function visible(ENV, $parse) {
    return {
      restrict: 'A',
      scope: {
        excludeMode: "@"
      },
      link: function(scope, element, attrs) {
        var doRemove = false, features;
        if (attrs.visibleIf) {
          features = [$parse(attrs.visibleIf)(scope)];
        } else {
          features = attrs.visible.split(',');
        }
        for (var i = 0; i < features.length; i++) {
          if ((ENV.toBeFeatures.indexOf(features[i].trim()) !== -1
              || (ENV.toBeFeatures.indexOf('resources') !== -1 && features[i].trim()) in ENV.resourcesTypes)
              && ENV.modeName !== attrs.excludeMode) {
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
