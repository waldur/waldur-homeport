'use strict';

(function() {

  angular.module('ncsaas')
    .directive('addBodyClass', [addBodyClass]);

  function addBodyClass() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var body = angular.element(document.body);
        var cls = attrs.addBodyClass;
        body.addClass(cls);
        scope.$on('$destroy', function() {
          body.removeClass(cls);
        });
      }
    };
  }
})();
