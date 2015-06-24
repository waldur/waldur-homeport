'use strict';

(function() {

  angular.module('ncsaas')
    .directive('abscenter', function($window) {
      return {
        restrict: 'A',
        link: function(scope, element) {
          var el = element[0];
          var elWidth = el.offsetWidth;
          element.css('margin-left', -(elWidth/2) + 'px');
        }
      };
    });

})();
