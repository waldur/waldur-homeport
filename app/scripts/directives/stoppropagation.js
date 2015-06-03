'use strict';

(function() {

  angular.module('ncsaas')
    .directive('stoppropagation', function() {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('click', function(event) {
                event.stopPropagation();
            });
        }
      };
    });

})();
