'use strict';

(function() {
  angular.module('ncsaas')
    .directive('detailsView', ['$rootScope', detailsView]);

  function detailsView($rootScope) {
    return {
      restrict: 'E',
      templateUrl: "views/directives/details-view.html",
      replace: true,
      scope: {
        options: '=detailsOptions',
        controller: '=detailsController'
      },
      link: function(scope) {
        scope.generalSearch = '';
        scope.search = search;

        function search() {
          $rootScope.$broadcast('generalSearchChanged', scope.generalSearch);
        }
      }
    };
  }
})();