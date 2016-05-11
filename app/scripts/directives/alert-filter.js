'use strict';

(function() {

  angular.module('ncsaas')
    .directive('alertFilter', function() {
      return {
        restrict: 'A',
        scope: {
          filterController: '='
        },
        templateUrl: 'views/directives/alert-filter.html',
        link: function(scope) {
          scope.openedOnly = true;

          function updateDefaultFilter() {
            var defaultFilter = scope.filterController.service.defaultFilter;
            if (scope.openedOnly) {
              defaultFilter.opened = true;
            } else {
              delete defaultFilter['opened'];
            }
            if (scope.closedOnly) {
              defaultFilter.closed = true;
            } else {
              delete defaultFilter['closed'];
            }
            scope.filterController.getList();
          }

          scope.$watch('openedOnly', function() {
            updateDefaultFilter();
          });
        }
      };
    });

})();
