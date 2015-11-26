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
          var getListPromise = scope.service.getList(filter);
          if (getListPromise && getListPromise.then) {
            scope.processing = true;
            getListPromise.then(function(response) {
              mergeLists(scope.controller.list, response);
              scope.processing = false;
            });
          }
        }

        function mergeLists(list1, list2) {
          list1 = list1 || [];
          var itemByUuid = {},
            deletedItemIndexes = [],
            newListUiids = list2.map(function(item) {
              return item.uuid;
            });
          for (var i = 0; i < list1.length; i++) {
            var item = list1[i];
            if (newListUiids.indexOf(item.uuid) === -1) {
              deletedItemIndexes.push(i);
              continue;
            }
            itemByUuid[item.uuid] = item;
          }
          for (var j = 0; j < deletedItemIndexes.length; j++) {
            list1.splice(deletedItemIndexes[j], 1);
          }
          for (var i = 0; i < list2.length; i++) {
            var item2 = list2[i];
            var item1 = itemByUuid[item2.uuid];
            if (!item1) {
              list1.push(item2);
              continue;
            }
            for(var key in item2) {
              item1[key] = item2[key];
            }
          }
        }
      }

    };
  }
})();
