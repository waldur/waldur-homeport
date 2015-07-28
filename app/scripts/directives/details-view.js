'use strict';

(function() {
  angular.module('ncsaas')
    .directive('detailsView', ['$rootScope', detailsView]);

  function detailsView() {
    return {
      restrict: 'E',
      templateUrl: "views/directives/details-view.html",
      replace: true,
      scope: {
        options: '=detailsOptions',
        controller: '=detailsController'
      }
    };
  }
})();