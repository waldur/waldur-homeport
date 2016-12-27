import template from './action-dialog.html';
import './action-dialog.scss';

export default function actionDialog() {
  return {
    restrict: 'E',
    template: template,
    controller: ActionDialogController
  };
}

// @ngInject
function ActionDialogController(
  $scope, $q, $http, resourcesService,
  actionUtilsService, ncUtils, ResourceFieldConfiguration) {
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
        if (field.resource_default_value) {
          $scope.form[name] = actionUtilsService.formatChoices(field, $scope.resource[name]);
        }
        if ($scope.action.name === 'edit') {
          $scope.form[name] = $scope.resource[name];
          if (field.type === 'datetime') {
            $scope.form[name] = new Date($scope.resource[name]);
          }
        }
        if (ResourceFieldConfiguration[field.type]) {
          field.fieldOptions = ResourceFieldConfiguration[field.type];
        }
      });
    },
    submitForm: function () {
      if ($scope.ActionForm.$invalid) {
        return $q.reject();
      }
      var fields = $scope.action.fields;
      var form = resourcesService.$create($scope.action.url);
      for (var name in fields) {
        if ($scope.form[name] != null) {
          var field = fields[name];
          var serializer = field.serializer || angular.identity;
          form[name] = serializer($scope.form[name]);
        }
      }

      var promise;
      var url;
      if ($scope.action.method === 'DELETE') {
        url = $scope.action.url + '?' + ncUtils.toKeyValue($scope.form);
        promise = $http.delete(url);
      } else if ($scope.action.method === 'PUT') {
        url = $scope.resource.url;
        promise = $http.put(url, form);
      } else {
        promise = form.$save();
      }

      return promise.then(function() {
        $scope.errors = {};
        actionUtilsService.handleActionSuccess($scope.action);
        $scope.controller.reInitResource($scope.resource);
        $scope.$close();
      }, function(response) {
        $scope.errors = response.data;
      });
    },
    cancel: function() {
      $scope.$dismiss();
    }
  });
  $scope.init();
}
