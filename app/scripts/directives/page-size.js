'use strict';

(function() {

  angular.module('ncsaas')
    .directive('pagesize', function() {
      return {
        restrict: 'E',
        templateUrl: "views/directives/page-size.html",
        replace: true,
        scope: {
          pagesHref: '@',
          pagesList: '=',
          pagesService: '='
        },
        link: function ($scope) {
          var pagesController = $scope.pagesList,
            pagesService = $scope.pagesService;
          pagesController.changePageSize = changePageSize;
          pagesController.pageSizes = pagesController.pageSizes || [5, 10, 20, 50];

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
        }
      };
    });

})();
