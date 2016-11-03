'use strict';

(function() {
  angular.module('ncsaas')
    .directive('actionButtonResource', [
      '$rootScope', 'actionUtilsService',
      actionButtonResource]);

  function actionButtonResource($rootScope, actionUtilsService) {
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
        scope.buttonsListToggle = function() {
          $rootScope.isActionListOpened = !$rootScope.isActionListOpened;
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
