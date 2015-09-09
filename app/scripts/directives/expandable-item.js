'use strict';

(function() {

  angular.module('ncsaas')
    .directive('expandableitem', [expandableItem]);

  function expandableItem() {
    var directiveViewPath = 'views/directives/expandable-item/',
      defaultView = directiveViewPath + 'expandable-item.html';
    return {
      restrict: 'E',
      template: '<div class="expand-item" ng-include="contentUrl"></div>',
      scope: {
        expandableElement: '=',
        expandableList: '=',
        expandableOptions: '='
      },
      link: function(scope) {
        scope.pageModels = scope.expandableList[scope.expandableOptions.listKey];
        scope.modelId = scope.expandableElement[scope.expandableOptions.modelId];
        scope.contentUrl = scope.expandableOptions.viewType
          ? directiveViewPath + 'expandable-item-' + scope.expandableOptions.viewType + '.html'
          : defaultView;
        if (scope.expandableOptions.getContent) {
          scope.expandableOptions.getContent(scope.expandableElement.url).then(function(response) {
            scope.model = response;
            scope.expandableOptions.getFieldList(response.url).then(function(fields) {
              scope.list = fields;
            });
          });
        }
      }
    };
  }

})();
