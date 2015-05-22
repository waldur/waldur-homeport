'use strict';

(function() {

  angular.module('ncsaas')
    .directive('filterList', ['ENV', '$state',pageSize]);

  function pageSize() {
    return {
      restrict: 'E',
      templateUrl: "views/directives/filter-list.html",
      replace: true,
      scope: {
        filterController: '='
      },
      link: function ($scope) {
        var controller = $scope.filterController;
        $scope.search = search;

        function search() {
          if (controller.searchInput) {
            controller.search();
          }
        }
      }
    };
  }

})();
