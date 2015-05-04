'use strict';

(function() {
  angular.module('ncsaas')
    .directive('minipagination', ['$state', miniPagination]);

  function miniPagination($state) {
    return {
      restrict: 'E',
      templateUrl: "views/directives/mini-pagination.html",
      replace: true,
      scope: {
        pageModels: '@',
        pageChange: '@',
        pageModelId: '@'
      },
      link: function($scope) {
        var modelId = $scope.pageModelId;
        $scope.numberList = null;
        if ($scope.pageModels[modelId]) {
          var change = $scope.pageChange,
            model = $scope.pageModels[modelId],
            count = model.pages,
            current = model.page;
          $scope.numberList = getNumberList(count, current);
          $scope.pageCurrent = current;
        }

        $scope.$on('mini-pagination:getNumberList', function (event, count, current, pageChange) {
          $scope.numberList = getNumberList(count, current);
          $scope.pageChange = pageChange;
          $scope.pageCurrent = current;
          $scope.pageCount = current;
        });

        function getNumberList(num, currentPage) {
          var firstPage,
            lastPage,
            pagesRange,
            interval = 5;

          firstPage = currentPage <= interval ? 1 : currentPage - interval;
          lastPage = currentPage > num - interval ? num : currentPage + interval;
          pagesRange = [];
          for (var i = firstPage; i <= lastPage; i++) {
            pagesRange.push(i);
          }
          return pagesRange;
        }
      }
    }
  }
})();