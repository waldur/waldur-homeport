'use strict';

(function() {

  angular.module('ncsaas')
    .directive('preventBodyScroll', [preventBodyScroll]);

  function preventBodyScroll() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var body = angular.element(document.body);
        var cls = 'disable-scroll';
        body.addClass(cls);
        scope.$on('$destroy', function() {
          body.removeClass(cls);
        });
      }
    };
  }
})();
