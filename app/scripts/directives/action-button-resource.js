'use strict';

(function() {
  angular.module('ncsaas')
    .directive('actionButtonResource', [
      'actionUtilsService',
      actionButtonResource]);

  function actionButtonResource(actionUtilsService) {
    return {
      restrict: 'E',
      templateUrl: 'views/directives/action-button-resource.html',
      scope: {
        buttonController: '=',
        buttonModel: '='
      },
      link: function (scope) {
        scope.actions = [];
        scope.loading = false;

        scope.buttonClick = function(name, action) {
          actionUtilsService.buttonClick(scope.buttonController, scope.buttonModel, name, action);
        };
        scope.openActionsListTrigger = function() {
          scope.loading = true;
          scope.actions = [];
          actionUtilsService.loadActions(scope.buttonModel).then(function(actions) {
            scope.actions = actions;
          }).finally(function() {
            scope.loading = false;
          });
        };
      }
    };
  }
})();
