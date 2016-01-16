'use strict';

(function() {

  angular.module('ncsaas')
    .directive('scrollToTop', ['$document', '$rootScope', scrollToTop]);

  function scrollToTop($document, $rootScope) {
    return {
      restrict: 'A',
      link: function(scope, element) {
        $rootScope.$on('$stateChangeSuccess', function() {
          $document.scrollTop(0);
        });
      }
    };
  }
})();
