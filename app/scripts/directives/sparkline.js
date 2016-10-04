'use strict';

(function() {

  angular.module('ncsaas')
    .directive('sparkline', sparkline);

  function sparkline() {
    return {
      restrict: 'E',
      scope: {
        sparkData: '=',
      },
      templateUrl: 'views/directives/sparkline.html',
      link: function(scope) {
        var max = Math.max.apply(null, scope.sparkData.map(function(item) {
          return item.value || 0;
        }));
        scope.items = scope.sparkData.map(function(item) {
          return angular.extend({}, item, {
            relative: max && Math.round(item.value * 100 / max)
          });
        });
      }
    };
  }
})();

