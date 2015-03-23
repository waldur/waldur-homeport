'use strict';

(function() {

  angular.module('ncsaas')
    .directive('pagesize', ['ENV',pageSize]);

  function pageSize(ENV) {
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
        debugger;
        var pagesController = $scope.pagesList,
          pagesService = $scope.pagesService;
        pagesController.changePageSize = changePageSize;
        pagesController.pageSizes = pagesController.pageSizes || ENV.pageSizes;

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
  }

})();
