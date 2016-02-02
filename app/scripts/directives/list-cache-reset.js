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
              scope.controller.adjustSearchFilters && scope.controller.adjustSearchFilters();
              mergeLists(scope.controller.list, response);
              scope.processing = false;
            });
          }
        }

        function mergeLists(list1, list2) {
          list1 = list1 || [];
          list2 = list2 || [];
          var itemByUuid = {},
            deletedItemUuids = [],
            newListUiids = list2.map(function(item) {
              return item.uuid;
            });
          for (var i = 0; i < list1.length; i++) {
            var item = list1[i];
            if (newListUiids.indexOf(item.uuid) === -1) {
              deletedItemUuids.push(item.uuid);
              continue;
            }
            itemByUuid[item.uuid] = item;
          }
          for (var j = 0; j < deletedItemUuids.length; j++) {
            for (var index = 0; index < list1.length; index++) {
              if (list1[index].id === deletedItemUuids[j]) {
                list1.splice(index, 1);
                break;
              }
            }
          }
          for (var i = 0; i < list2.length; i++) {
            var item2 = list2[i];
            var item1 = itemByUuid[item2.uuid];
            if (!item1) {
              list1.push(item2);
              continue;
            }
            for (var key in item2) {
              item2.hasOwnProperty(key) && (item1[key] = item2[key]);
            }
          }
        }
      }

    };
  }
})();
