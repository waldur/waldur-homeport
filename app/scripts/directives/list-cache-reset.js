'use strict';

(function() {
  angular.module('ncsaas')
    .directive('listCacheReset', ['$rootScope', listCacheReset]);

  function listCacheReset() {
    return {
      restrict: 'E',
      templateUrl: "views/directives/list-cache-reset.html",
      replace: true,
      scope: {
        controller: '=listController',
        service: '=listService'
      },
      link: function(scope) {
        scope.resetCache = resetCache;
        scope.processing = false;
        function resetCache() {
          scope.service.cacheReset = true;
          scope.processing = true;
          scope.controller.getList().then(function() {
            scope.processing = false;
          });
        }
      }

    };
  }
})();