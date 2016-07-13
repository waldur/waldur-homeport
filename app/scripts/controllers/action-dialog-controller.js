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
        $scope.getSelectList().finally(function() {
          $scope.loading = false;
        });
        angular.forEach($scope.action.fields, function(field, name) {
          if (field.default_value) {
            $scope.form[name] = field.default_value;
          }
        });
      },
      getSelectList: function () {
        var vm = this;
        var promises = [];
        angular.forEach($scope.action.fields, function(field) {
          if (field.url) {
            promises.push(vm.loadChoices(field));
          }
        });
        return $q.all(promises);
      },
      loadChoices: function(field) {
        var url = field.url, query_params = {};
        var parts = field.url.split("?");
        if (parts.length == 2) {
          url = parts[0];
          query_params = ncUtils.parseQueryString(parts[1]);
        }

        return resourcesService.getList(query_params, url).then(function(response) {
          field.list = response.map(function(item) {
            return {
              value: item[field.value_field],
              display_name: item[field.display_name_field]
            }
          });
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
