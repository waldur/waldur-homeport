'use strict';

(function() {
  angular.module('ncsaas')
    .directive('actionButtonResource', [
      '$rootScope', 'resourcesService', 'actionUtilsService',
      actionButtonResource]);

  function actionButtonResource($rootScope, resourcesService, actionUtilsService) {
    return {
      restrict: 'E',
      templateUrl: 'views/directives/action-button-resource.html',
      replace: true,
      scope: {
        buttonController: '=',
        buttonModel: '='
      },
      link: function (scope) {
        scope.actions = null;
        scope.loading = false;

        scope.buttonClick = function(name, action) {
          action.pending = true;
          var promise = actionUtilsService.buttonClick(scope.buttonController, scope.buttonModel, name, action);
          promise.finally(function() {
            action.pending = false;
          });
        }
        scope.openActionsListTrigger = openActionsListTrigger;

        var controller = scope.buttonController;
        controller.actionButtonsList = controller.actionButtonsList || [];
        controller.actionButtonsList[scope.$id] = false;

        function openActionsListTrigger() {
          loadActions();
          if (!controller.actionButtonsList[scope.$id]) {
            scope.$broadcast('actionButton:close');
          }
          controller.actionButtonsList[scope.$id] = !controller.actionButtonsList[scope.$id];
        }

        function loadActions() {
          scope.loading = true;
          actionUtilsService.loadActions(scope.buttonModel).then(function(response) {
            if (response.actions) {
              scope.actions = response.actions;
            }
          }).finally(function() {
            scope.loading = false;
          });
        }

        function closeAll() {
          for (var i = 0; controller.actionButtonsList.length > i; i++) {
            controller.actionButtonsList[i] = false;
          }
        }

        scope.$on('actionButton:close', closeAll);
        $rootScope.$on('clicked-out', closeAll);
      }
    };
  }
})();
