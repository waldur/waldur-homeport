'use strict';

(function() {
  angular.module('ncsaas')
    .directive('actionButton', ['$rootScope', actionButton]);

  function actionButton($rootScope) {
    return {
      restrict: 'E',
      templateUrl: "views/directives/action-button.html",
      replace: true,
      scope: {
        buttonList: '=', // should be [{title: 'Click', clickFunction: function(model) {}}]
        buttonController: '=',
        buttonModel: '=', // using in ng-click="button.clickFunction(buttonModel)"
        buttonType: '@'
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
          toggleMenu();
        }

        function toggleMenu() {
          controller.actionButtonsList[scope.$id] = !controller.actionButtonsList[scope.$id];
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
