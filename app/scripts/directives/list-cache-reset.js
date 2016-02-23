'use strict';

(function() {
  angular.module('ncsaas')
    .directive('listCacheReset', ['$rootScope', listCacheReset]);

  function listCacheReset($rootScope) {
    return {
      restrict: 'E',
      templateUrl: "views/directives/list-cache-reset.html",
      replace: true,
      scope: {
        controller: '=listController',
        service: '=listService',
        timer: '=listTimer'
      },
      link: function(scope, element) {
        if (!scope.service.clearAllCacheForCurrentEndpoint) {
          element.remove();
          return;
        }
        scope.resetCache = resetCache;
        scope.processing = false;
        if (scope.timer) {
          if ($rootScope.listCacheResetTimer) {
            clearInterval($rootScope.listCacheResetTimer);
          }
          var timer = scope.timer * 1000;
          $rootScope.listCacheResetTimer = setInterval(resetCache, timer);
          scope.$on(
            "$destroy",
            function() {
              if ($rootScope.listCacheResetTimer) {
                clearInterval($rootScope.listCacheResetTimer);
              }
            }
          );
        }
        function resetCache() {
          var filter = {};
          scope.service.cacheReset = true;
          scope.service.clearAllCacheForCurrentEndpoint();
          filter[scope.controller.searchFieldName] = scope.controller.searchInput;
          var getListPromise = scope.controller.getList(filter);
          if (getListPromise && getListPromise.then) {
            scope.processing = true;
            getListPromise.then(function(response) {
              scope.processing = false;
            });
          }
        }
      }

    };
  }
})();
