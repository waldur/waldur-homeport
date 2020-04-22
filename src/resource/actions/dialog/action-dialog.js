import Axios from 'axios';

import { toKeyValue } from '@waldur/core/utils';

import template from './action-dialog.html';

// @ngInject
function ActionDialogController(
  $scope,
  $q,
  $state,
  $rootScope,
  actionUtilsService,
  ncUtilsFlash,
  ActionResourceLoader,
  DEFAULT_FIELD_OPTIONS,
) {
  angular.extend($scope, {
    init: function() {
      $scope.errors = {};
      $scope.form = {};
      $scope.loading = true;
      let promise;
      if ($scope.action.init) {
        promise = $scope.action.init(
          $scope.resource,
          $scope.form,
          $scope.action,
        );
      } else {
        promise = ActionResourceLoader.getSelectList($scope.action.fields);
      }
      promise
        .then(function() {
          angular.forEach($scope.action.fields, function(field, name) {
            if (field.init) {
              field.init(field, $scope.resource, $scope.form, $scope.action);
            }
            if (field.default_value) {
              $scope.form[name] = field.default_value;
            }
            if (
              !field.init &&
              (field.resource_default_value || $scope.action.method === 'PUT')
            ) {
              $scope.form[name] = angular.copy($scope.resource[name]);
            }
            if (field.modelParser) {
              $scope.form[name] = field.modelParser(field, $scope.form[name]);
            }
            if (field.type === 'multiselect' && !$scope.action.init) {
              $scope.form[name] = ActionResourceLoader.formatChoices(
                field,
                $scope.form[name],
              );
            }
            if ($scope.action.name === 'edit') {
              $scope.form[name] = $scope.resource[name];
              if (field.type === 'datetime' && $scope.resource[name]) {
                $scope.form[name] = new Date($scope.resource[name]);
              }
            }
            if (DEFAULT_FIELD_OPTIONS[field.type]) {
              field.options = DEFAULT_FIELD_OPTIONS[field.type];
            }
          });
          if ($scope.action.order) {
            $scope.fields = $scope.action.order.reduce((result, name) => {
              result[name] = $scope.action.fields[name];
              return result;
            }, {});
          } else {
            $scope.fields = $scope.action.fields;
          }
        })
        .finally(function() {
          $scope.loading = false;
          // Trigger digest for async/await
          $rootScope.$applyAsync();
        });
    },
    submitActive: function() {
      return (
        $scope.ActionForm.$dirty ||
        $scope.action.method === 'DELETE' ||
        !$scope.action.fields
      );
    },
    submitForm: function() {
      if ($scope.ActionForm.$invalid) {
        return $q.reject();
      }
      const fields = $scope.action.fields;
      if (!$scope.action.url) {
        $scope.action.url = $scope.resource.url + $scope.action.name + '/';
      }
      let form = {};
      if ($scope.action.serializer) {
        form = $scope.action.serializer($scope.form);
      } else {
        for (const name in fields) {
          if ($scope.form[name] !== null) {
            const field = fields[name];
            const serializer = field.serializer || angular.identity;
            form[name] = serializer($scope.form[name], field);
          }
        }
      }

      let promise;
      let url;
      if ($scope.action.method === 'DELETE') {
        url = $scope.action.url + '?' + toKeyValue($scope.form);
        promise = Axios.delete(url);
      } else if ($scope.action.method === 'PUT') {
        url = $scope.resource.url;
        promise = Axios.put(url, form);
      } else {
        promise = Axios.post($scope.action.url, form);
      }

      return promise.then(
        function(response) {
          $scope.errors = {};
          actionUtilsService.handleActionSuccess($scope.action);

          if (response.status === 201 && $scope.action.followRedirect) {
            const resource = response.data;
            return $state.go('resources.details', {
              resource_type: resource.resource_type,
              uuid: resource.uuid,
            });
          }

          $scope.controller.reInitResource($scope.resource);
          $scope.$close();
        },
        function(response) {
          $scope.errors = response.data;
          ncUtilsFlash.errorFromResponse(
            response,
            gettext('Unable to perform action'),
          );
        },
      );
    },
    cancel: function() {
      $scope.$dismiss();
    },
  });
  $scope.init();
}

// TODO: Convert directive to Angular 1.5 component
export default function actionDialog() {
  return {
    restrict: 'E',
    template: template,
    controller: ActionDialogController,
  };
}
