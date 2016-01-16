'use strict';

(function() {

  angular.module('ncsaas')
    .directive('scrollToMe', ['$document', '$timeout', scrollToMe]);

  function scrollToMe($document, $timeout) {
    return {
      restrict: 'A',
      scope: {
        'containerClass': '='
      },
      link: function(scope, element, attrs) {
        var container = angular.element($document[0].getElementsByClassName(attrs.containerClass));
        element.bind('click', function() {
          click();
        });
        function click() {
          $timeout(function() {
            container.scrollTo(element);
          }, 1);
        }
      }
    };
  }
})();
