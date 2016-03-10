'use strict';

(function() {
  angular.module('ncsaas')
    .directive('actionButtonResource', ['$rootScope', 'resourcesService', 'ngDialog', 'ENV',
      actionButtonResource]);

  function actionButtonResource($rootScope, resourcesService, ngDialog, ENV) {
    return {
      restrict: 'E',
      templateUrl: 'views/directives/action-button-resource.html',
      replace: true,
      scope: {
        buttonController: '=',
        buttonModel: '=',
        buttonType: '@'
      },
      link: function (scope) {
        scope.errors = {};
        scope.actions = null;
        scope.loading = false;

        scope.buttonClick = buttonClick;
        scope.openActionsListTrigger = openActionsListTrigger;

        var controller = scope.buttonController;
        controller.actionButtonsList = controller.actionButtonsList || [];
        controller.actionButtonsList[scope.$id] = false;

        function buttonClick(action) {
          if (action.type === 'button') {
            if (action.destructive) {
              if (confirm('Are you sure? This action cannot be undone.')) {
                applyAction(action);
              }
            } else {
              applyAction(action);
            }
          } else if (action.type === 'form') {
            var scope = $rootScope.$new();
            scope.action = action;
            ngDialog.open({
              templateUrl: 'views/directives/action-dialog.html',
              className: 'ngdialog-theme-default',
              scope: scope
            });
          }
        }

        function applyAction(action) {
          return resourcesService.$create(action.url).$save();
        }

        function openActionsListTrigger() {
          loadActions();
          if (!controller.actionButtonsList[scope.$id]) {
            scope.$broadcast('actionButton:close');
          }
          controller.actionButtonsList[scope.$id] = !controller.actionButtonsList[scope.$id];
        }

        function loadActions() {
          if (scope.actions != null) {
            return;
          }
          scope.loading = true;
          resourcesService.getOption(scope.buttonModel.url).then(function(response) {
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
    ['$scope', 'resourcesService', ActionDialogController]);

  function ActionDialogController($scope, resourcesService) {
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
        return $scope.form.$save(function() {
          $scope.errors = {};
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
