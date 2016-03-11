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
        scope.errors = {};
        scope.actions = null;
        scope.loading = false;

        scope.buttonClick = function(name, action) {
          actionUtilsService.buttonClick(scope.buttonController, scope.buttonModel, name, action);
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

  angular.module('ncsaas').controller('ActionDialogController', 
    ['$scope', 'resourcesService', 'actionUtilsService', ActionDialogController]);

  function ActionDialogController($scope, resourcesService, actionUtilsService) {
    angular.extend($scope, {
      init: function () {
        $scope.errors = {};
        $scope.form = resourcesService.$create($scope.action.url);
        $scope.getSelectList();
      },
      getSelectList: function () {
        var fields = $scope.action.fields;
        angular.forEach(fields, function(field) {
          if (field.url) {
            resourcesService.getList({}, field.url).then(function(response) {
              field.list = response;
            });
          }
        });
      },
      submitForm: function () {
        var fields = $scope.action.fields;
        for (var field in fields) {
          if (fields[field].required && !$scope.form[field]) {
            $scope.errors[field] = ['This field is required'];
            return;
          }
        }
        return $scope.form.$save(function(response) {
          $scope.errors = {};
          actionUtilsService.handleActionSuccess($scope.action);
          $scope.controller.reInitResource($scope.resource);
          $scope.closeThisDialog();
        }, function(response) {
          $scope.errors = response.data;
        });
      },
      cancel: function() {
        $scope.closeThisDialog();
      }
    });
    $scope.init();
  }

})();
