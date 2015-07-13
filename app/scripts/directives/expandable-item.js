'use strict';

(function() {

  angular.module('ncsaas')
    .directive('expandableitem', [expandableItem]);

  function expandableItem() {
    return {
      restrict: 'E',
      template: '<div ng-include="contentUrl"></div>',
      scope: {
        expandableElement: '=',
        expandableList: '=',
        expandableOptions: '='
      },
      link: function(scope) {
        scope.pageModels = scope.expandableList[scope.expandableOptions.listKey];
        scope.modelId = scope.expandableElement[scope.expandableOptions.modelId];
        scope.contentUrl = scope.expandableOptions.directiveTypeSupport
          ? 'views/directives/expandable-item/expandable-item-'+ scope.expandableOptions.directiveTypeSupport +'.html'
          : 'views/directives/expandable-item/expandable-item.html';
      }
    };
  }

})();
