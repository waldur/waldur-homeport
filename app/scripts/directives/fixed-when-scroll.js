'use strict';

(function() {

  angular.module('ncsaas')
    .directive('fixedwhentop', function($window) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
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
