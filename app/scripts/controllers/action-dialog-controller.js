'use strict';

(function() {
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
