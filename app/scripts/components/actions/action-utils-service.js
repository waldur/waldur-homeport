// @ngInject
export default function actionUtilsService(
  ncUtilsFlash, $rootScope, $http, $q, $uibModal, $filter, ncUtils, resourcesService, ActionConfiguration) {
  this.loadActions = function(model) {
    resourcesService.cleanOptionsCache(model.url);
    return resourcesService.getOption(model.url).then(response => {
      const config = ActionConfiguration[model.resource_type];
      const order = config && config.order || Object.keys(response.actions);
      const options = config && config.options || {};
      return order.reduce((result, name) => {
        let action = angular.merge({}, response.actions[name], options[name]);
        if (action.hasOwnProperty('enabled')) {
          result[name] = action;
        }
        return result;
      }, {});
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
        let obj = {};
        if (field.resource_default_value) {
          obj.name =item.name;
          obj.url = item[field.value_field];
          obj.description = item.description;
          obj.rules = item.rules;
        } else {
          obj.value = item[field.value_field];
          obj.display_name = field.formatter ? field.formatter($filter, item) : item[field.display_name_field];
        }
        return obj;
      });
    });
  };

  this.loadRawChoices = function(field) {
    var url = field.url, query_params = {};
    var parts = field.url.split('?');
    if (parts.length === 2) {
      url = parts[0];
      query_params = ncUtils.parseQueryString(parts[1]);
    }
    return $http.get(url, {params: query_params}).then(function(response) {
      return response.data;
    });
  };

  this.buttonClick = function(controller, model, name, action) {
    if (action.type === 'button') {
      if (!action.destructive || this.confirmAction(model, name)) {
        return this.applyAction(controller, model, action);
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

  this.applyAction = function(controller, resource, action) {
    var vm = this;
    var promise = (action.method === 'DELETE') ? $http.delete(action.url) : $http.post(action.url);

    function onSuccess(response) {
      if (response.status === 204) {
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
    var template = 'Request to {action} has been accepted';
    var message = template.replace('{action}', action.title.toLowerCase());
    ncUtilsFlash.success(message);
  };

  this.openActionDialog = function(controller, resource, name, action) {
    var component = action.component || 'actionDialog';
    var dialogScope = $rootScope.$new();
    dialogScope.action = action;
    dialogScope.controller = controller;
    dialogScope.resource = resource;
    $uibModal.open({
      component: component,
      scope: dialogScope,
      size: action.dialogSize
    }).result.then(function() {
      $rootScope.$broadcast('actionApplied', name);
    });
  };
}
