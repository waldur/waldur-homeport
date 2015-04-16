'use strict';

(function() {

  angular.module('ncsaas')
    .directive('pagination', ['$state', pagination]);

  function pagination($state) {
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
        pagesController.currentPageSize = pagesController.currentPageSize || pagesService.pageSize;
        pagesController.currentPage = pagesController.currentPage || pagesService.page;
        pagesController.changePage = changePage;
        pagesController.getNumber = getNumber;

        function changePage(page) {
          pagesController.currentPage = page;
          pagesService.page = page;
          pagesService.getList().then(function(response) {
            pagesController.pages = pagesService.pages;
            pagesController.list = response;
          });
        }

        function getNumber(num, currentPage) {
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
    };
  }

})();
