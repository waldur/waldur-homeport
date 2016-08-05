'use strict';

(function() {
  angular.module('ncsaas').controller('ActionDialogController',
    ['$scope', '$q', '$http', 'resourcesService', 'actionUtilsService', 'ncUtils', ActionDialogController]);

  function ActionDialogController($scope, $q, $http, resourcesService, actionUtilsService, ncUtils) {
    angular.extend($scope, {
      init: function () {
        $scope.errors = {};
        $scope.form = {};
        $scope.loading = true;
        actionUtilsService.getSelectList($scope.action.fields).finally(function() {
          $scope.loading = false;
        });
        angular.forEach($scope.action.fields, function(field, name) {
          if (field.default_value) {
            $scope.form[name] = field.default_value;
          }
        });
      },
      submitForm: function () {
        var fields = $scope.action.fields;
        var form = resourcesService.$create($scope.action.url);
        for (var field in fields) {
          if (fields[field].required && !$scope.form[field]) {
            $scope.errors[field] = ['This field is required'];
            return $q.reject();
          } else if ($scope.form[field] != null) {
            form[field] = $scope.form[field];
          }
        }

        if ($scope.action.method == 'DELETE') {
          var url = $scope.action.url + '?' + ncUtils.toKeyValue($scope.form);
          var promise = $http.delete(url);
        } else {
          var promise = form.$save();
        }

        return promise.then(function(response) {
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
