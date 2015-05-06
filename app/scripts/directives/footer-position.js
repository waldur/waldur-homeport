'use strict';

(function() {

  angular.module('ncsaas')
    .directive('footerposition', function($window, $document) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {

          // get app container
          var appContainer = $document[0].getElementById('appContainer');
          // get window size
          var winHeight = $window.innerHeight;

          // watch app container height, if height more
          // than window height set fixed class for footer
          scope.$watch(function() {
              scope.appContainer_height = (appContainer.offsetHeight + 50);
              if (scope.appContainer_height < winHeight) {
                element.addClass('app-footer-fixed');
              } else {
                element.removeClass('app-footer-fixed');
              }
          });
        }
      };
    });

})();
