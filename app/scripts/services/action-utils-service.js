'use strict';

(function() {
  angular.module('ncsaas')
    .service('actionUtilsService', [
      'ncUtilsFlash', '$rootScope', '$http', '$q', '$uibModal', 'resourcesService', actionUtilsService]);

  function actionUtilsService(ncUtilsFlash, $rootScope, $http, $q, $uibModal, resourcesService) {
    this.loadActions = function(model) {
      resourcesService.cleanOptionsCache(model.url);
      return resourcesService.getOption(model.url).then(function(response) {
        var actions = {};
        var empty = true;
        angular.forEach(response.actions, function(action, name) {
          if (typeof action.title == 'string') {
            actions[name] = action;
            empty = false;
          }
          if (action.fields && action.fields.delete_volumes) {
            action.fields.delete_volumes.default_value = true;
          }
        });
        if (!empty) {
          return actions;
        }
      });
    };

    this.getSelectList = function(fields) {
      var vm = this;
      var promises = [];
      angular.forEach(fields, function(field) {
        if (field.url) {
          promises.push(vm.loadChoices(field));
        }
      });
      return $q.all(promises);
    };

    this.loadChoices = function(field) {
      return this.loadRawChoices(field).then(function(response) {
        field.list = response.map(function(item) {
          return {
            value: item[field.value_field],
            display_name: item[field.display_name_field]
          }
        });
      });
    };

    this.loadRawChoices = function(field) {
      var url = field.url, query_params = {};
      var parts = field.url.split("?");
      if (parts.length === 2) {
        url = parts[0];
        query_params = ncUtils.parseQueryString(parts[1]);
      }
      return resourcesService.getList(query_params, url);
    };

    this.buttonClick = function(controller, model, name, action) {
      if (action.type === 'button') {
        if (!action.destructive || this.confirmAction(model, name)) {
          return this.applyAction(controller, model, name, action);
        }
      } else if (action.type === 'form') {
        this.openActionDialog(controller, model, name, action);
        return $q.when(true);
      }
      return $q.reject();
    };

    this.confirmAction = function(model, name) {
      if (name === 'destroy') {
        var confirmText = (model.state === 'Erred')
          ? 'Are you sure you want to delete a {resource_type} in an Erred state?' +
            ' A cleanup attempt will be performed if you choose so.'
          : 'Are you sure you want to delete a {resource_type}?';
        return confirm(confirmText.replace('{resource_type}', model.resource_type));
      } else {
        return confirm('Are you sure? This action cannot be undone.');
      }
    };

    this.applyAction = function(controller, resource, name, action) {
      var vm = this;
      var promise = (action.method == 'DELETE') ? $http.delete(action.url) : $http.post(action.url);

      function onSuccess(response) {
        if (response.status == 204) {
          ncUtilsFlash.success('Resource has been deleted');
          controller.afterInstanceRemove(resource);
        } else {
          vm.handleActionSuccess(action);
          return controller.reInitResource(resource);
        }
      }

      return promise.then(onSuccess, controller.handleActionException.bind(controller));
    };

    this.handleActionSuccess = function(action) {
      var template = "Request to {action} has been accepted";
      var message = template.replace("{action}", action.title.toLowerCase());
      ncUtilsFlash.success(message);
    };

    this.openActionDialog = function(controller, resource, name, action) {
      var templateUrl = 'views/directives/action-dialog.html';
      var controllerName = 'ActionDialogController';

      if (resource.resource_type === 'DigitalOcean.Droplet' && name === 'resize') {
        controllerName = 'ResizeDropletController';
        templateUrl = 'views/resource/droplet-resize.html';
      }

      var dialogScope = $rootScope.$new();
      dialogScope.action = action;
      dialogScope.controller = controller;
      dialogScope.resource = resource;
      $uibModal.open({
        templateUrl: templateUrl,
        controller: controllerName,
        scope: dialogScope
      });
    };
  }

})();
