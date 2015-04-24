'use strict';

(function() {

  angular.module('ncsaas')
    .directive('footerposition', function($window, $document) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {

          // get app container
          var foo = $document[0].getElementById('appContainer');
          // get window size
          var winHeight = $window.innerHeight;

          // watch app container height, if height more
          // than window height set fixed class for footer
          scope.$watch(function() {
              scope.foo_height = foo.offsetHeight;
              if (scope.foo_height < winHeight) {
                element.addClass('fixed');
              } else {
                element.removeClass('fixed');
              }
          });
        }
      };
    });

})();
