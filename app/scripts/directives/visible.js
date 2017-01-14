'use strict';

(function() {

  angular.module('ncsaas')
    .directive('visible', ['features', visible]);

  // This directive is deprecated. Please use visible-if directive instead which parses expression.
  // For example: <a visible="resources"></a> becomes <a visible="'resources'"></a>
  function visible(features) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        if (!features.isVisible(attrs.visible)) {
          element.remove();
        }
      }
    };
  }

})();
