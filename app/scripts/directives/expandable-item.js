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
        scope.modelId = scope.expandableElement[scope.expandableOptions.modelId];
      }
    };
  }

})();
