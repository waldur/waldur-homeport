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
        expandableOptions: '=',
        minipaginationOptions: '='
      },
      link: function(scope) {
        scope.pageModels = scope.expandableList[scope.expandableOptions.pageModels];
        scope.pageModelId = scope.expandableElement[scope.expandableOptions.pageModelId];
      }
    };
  }

})();
