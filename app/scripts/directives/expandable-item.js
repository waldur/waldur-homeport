'use strict';

(function() {

  angular.module('ncsaas')
    .directive('expandableitem', [expandableItem]);

  function expandableItem() {
    return {
      restrict: 'E',
      templateUrl: 'views/directives/expandable-item.html',
      replace: true,
      scope: {
        expandableElement: '=',
        expandableList: '=',
        expandableOptions: '='
      },
      link: function(scope) {
        scope.pageModels = scope.expandableList[scope.expandableOptions.listKey];
        scope.pageModelId = scope.expandableElement[scope.expandableOptions.minipaginationData.pageModelId];
        scope.pageChange = scope.expandableList[scope.expandableOptions.minipaginationData.pageChange];
      }
    };
  }

})();
