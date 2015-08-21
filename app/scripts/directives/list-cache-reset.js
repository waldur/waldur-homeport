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
          var getListPromise = scope.controller.getList();
          if (getListPromise && getListPromise.then) {
            scope.processing = true;
            getListPromise.then(function() {
              scope.processing = false;
            });
          }
        }
      }

    };
  }
})();