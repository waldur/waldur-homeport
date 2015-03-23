'use strict';

(function() {

  angular.module('ncsaas')
    .directive('pagesize', ['ENV', '$state',pageSize]);

  function pageSize(ENV, $state) {
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
        $scope.pagesHref = $scope.pagesHref || $state.href($state.current.name, $state.params, {absolute: true});
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
