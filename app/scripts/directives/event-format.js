'use strict';

(function() {

  angular.module('ncsaas')
    .directive('eventFormat', ['eventFormatter', eventFormat]);

    function eventFormat(eventFormatter) {
      return {
        restrict: 'E',
        scope: {
            'event': '='
        },
        link: function(scope, element) {
            var html = eventFormatter.format(scope.event);
            element.html(html);
        }
      };
    };

})();
