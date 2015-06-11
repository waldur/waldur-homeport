'use strict';

(function() {
  angular.module('ncsaas')
    .directive('actionButton', [actionButton]);

  function actionButton() {
    return {
      restrict: 'E',
      templateUrl: "views/directives/action-button.html",
      replace: true,
      scope: {
        buttonList: '=', // should be [{title: 'Click', clickFunction: function(model) {}}]
        buttonController: '=',
        buttonModel: '=' // using in ng-click="button.clickFunction(buttonModel)"
      },
      link: function (scope) {
        var controller = scope.buttonController;
        controller.actionButtonsList = controller.actionButtonsList || [];
        controller.actionButtonsList[scope.$id] = false;
        scope.openActionsListTrigger = openActionsListTrigger;

        function openActionsListTrigger() {
          if (!controller.actionButtonsList[scope.$id]) {
            scope.$broadcast('actionButton:close');
          }
          controller.actionButtonsList[scope.$id] = !controller.actionButtonsList[scope.$id];
        }

        scope.$on('actionButton:close', function() {
          for (var i = 0; controller.actionButtonsList.length > i; i++) {
            controller.actionButtonsList[i] = false;
          }
        });
      }
    };
  }

})();
