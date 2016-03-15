'use strict';

(function() {
  angular.module('ncsaas').controller('ActionDialogController',
    ['$scope', '$q', 'resourcesService', 'actionUtilsService', 'ncUtils', ActionDialogController]);

  function ActionDialogController($scope, $q, resourcesService, actionUtilsService, ncUtils) {
    angular.extend($scope, {
      init: function () {
        $scope.errors = {};
        $scope.form = {};
        $scope.getSelectList();
      },
      getSelectList: function () {
        var fields = $scope.action.fields;
        angular.forEach(fields, function(field) {
          if (field.url) {
            var url = field.url, query_params = {};
            var parts = field.url.split("?");
            if (parts.length == 2) {
              url = parts[0];
              query_params = ncUtils.parseQueryString(parts[1]);
            }

            resourcesService.getList(query_params, url).then(function(response) {
              field.list = response.map(function(item) {
                return {
                  value: item[field.value_field],
                  display_name: item[field.display_name_field]
                }
              });
            });
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

        return form.$save(function(response) {
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
