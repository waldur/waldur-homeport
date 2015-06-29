'use strict';

(function() {

  angular.module('ncsaas')
    .directive('pagination', ['$state', 'ENV', pagination]);

  function pagination($state, ENV) {
    return {
      restrict: 'E',
      templateUrl: "views/directives/pagination.html",
      replace: true,
      scope: {
        pagesHref: '@',
        pagesList: '=',
        pagesService: '='
      },
      link: function ($scope) {
        var pagesController = $scope.pagesList,
          pagesService = $scope.pagesService;
        $scope.pagesHref = $scope.pagesHref || $state.href($state.current.name, $state.params, {absolute: true});

        pagesController.pageSizes = pagesController.pageSizes || ENV.pageSizes;
        pagesController.currentPageSize = pagesController.currentPageSize || pagesService.pageSize;
        pagesController.changePageSize = changePageSize;
        pagesController.currentPage = pagesController.currentPage || pagesService.page;
        pagesController.changePage = changePage;
        pagesController.getNumber = getNumber;

        function changePageSize(pageSize) {
          pagesController.currentPageSize = pageSize;
          pagesController.currentPage = 1;
          pagesService.page = 1;
          pagesService.pageSize = pageSize;
          pagesService.getList().then(function(response) {
            pagesController.pages = pagesService.pages;
            pagesController.list = response;
          });
        }

        function changePage(page) {
          pagesController.currentPage = page;
          pagesService.page = page;
          pagesService.getList().then(function(response) {
            pagesController.list = response;
          });
        }

        function getNumber(num, currentPage) {
          var firstPage,
            lastPage,
            pagesRange,
            interval = 2;

          firstPage = currentPage <= interval ? 1 : currentPage - interval;
          lastPage = currentPage > num - interval ? num : currentPage + interval;
          if (currentPage >= num - interval) {
            var finishFirstPage = firstPage - (interval - (num - currentPage));
            firstPage = finishFirstPage > 0
              ? finishFirstPage
              : (finishFirstPage + 1 > 0 ? finishFirstPage + 1 : firstPage);
          }
          if (currentPage <= interval) {
            var startLastPage = lastPage + (interval - currentPage) + 1;
            lastPage = startLastPage <= num
              ? startLastPage
              : (startLastPage - 1 <= num ? startLastPage - 1 : lastPage);
          }
          pagesRange = [];
          for (var i = firstPage; i <= lastPage; i++) {
            pagesRange.push(i);
          }
          return pagesRange;
        }
      }
    };
  }

})();
