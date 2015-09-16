'use strict';

(function() {

  angular.module('ncsaas')
    .directive('loginboxcontext', function($window) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          var elHeight = element[0].offsetHeight;
          element.css('margin-top', -elHeight / 2 + 45 + 'px');
        }
      };
    });

})();
