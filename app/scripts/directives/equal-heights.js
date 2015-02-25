'use strict';

(function() {

  angular.module('ncsaas')
    .directive('equalHeights', EqualHeightsDirective);

    function EqualHeightsDirective($window, $timeout) {
      return {
        restrict: 'A',
        scope: {},
        link: function($scope, element, attrs) {
          $timeout(function() {

            var children = element.children(),
            currentMaxHeight = 0;

            console.log(children);

            angular.forEach(children, function(child) {
              var childHeight = child.offsetHeight;

              if (childHeight > currentMaxHeight) {
                currentMaxHeight = childHeight;
              }
            });

            angular.element(children).css('height', currentMaxHeight + 'px');

          }, 100);
        }
      }
    }

})();
