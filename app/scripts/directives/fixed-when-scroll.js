'use strict';

(function() {

  angular.module('ncsaas')
    .directive('fixedWhenScroll', function($window) {
      return {
        restrict: 'A',
        link: function(scope, element) {
          var el = element[0];
          var elTop = el.getBoundingClientRect().top;
          var elWidth = el.offsetWidth;
          element.css('width', elWidth + 'px');
          angular.element($window).bind("scroll", function() {
            if ($window.pageYOffset >= elTop) {
              element.addClass('fixed');
            } else {
              element.removeClass('fixed');
            }
          });
        }
      };
    });

})();
