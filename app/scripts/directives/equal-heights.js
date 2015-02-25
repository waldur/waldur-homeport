'use strict';

(function() {

  angular.module('ncsaas')
    .directive('equalHeights', EqualHeightsDirective);

    function EqualHeightsDirective($window, $timeout) {
      return {
        restrict: 'A',
        scope: {
          isParentShown: '&'
        },
        link: function($scope, element, attrs) {

          $scope.$watch($scope.isParentShown, function() {
            $timeout(function() {

              var children = element.children().children().children().children(),
              currentMaxHeight = 0;
              console.log(children);

              angular.forEach(children, function(child) {

                var childHeight = child.offsetHeight;

                if (childHeight > currentMaxHeight) {
                  currentMaxHeight = childHeight;
                }

              });

              angular.element(children).css('height', currentMaxHeight + 'px');

            }, 400);
          });
        }
      }
    }

})();
