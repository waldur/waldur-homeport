// @ngInject
export default function actionUtilsService(
  ncUtilsFlash, $rootScope, HttpUtils, $http, $q, $uibModal, $filter, ncUtils,
  resourcesService, ActionConfiguration) {
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
        if (action.fields) {
          angular.forEach(action.fields, (action, name) => {
            action.name = name;
          });
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
    return this.loadRawChoices(field).then(items => {
      let choices = this.formatChoices(field, items);
      if (field.emptyLabel && !field.required) {
        choices.unshift({
          display_name: field.emptyLabel
        });
      }
      field.choices = choices;
    });
  };

  this.formatChoices = function(field, items) {
    const formatter = item => field.formatter ?
                              field.formatter($filter, item) :
                              item[field.display_name_field];
    return items.map(item => ({
      value: item[field.value_field],
      display_name: formatter(item)
    }));
  };

  this.loadRawChoices = function(field) {
    return HttpUtils.getAll(field.url);
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
    const custom = ActionConfiguration[model.resource_type];
    let confirmTextSuffix = custom && custom.delete_message || '';
    if (name === 'destroy') {
      var confirmText = (model.state === 'Erred')
        ? 'Are you sure you want to delete a {resource_type} in an Erred state?' +
          ' A cleanup attempt will be performed if you choose so. {confirmTextSuffix}'
        : 'Are you sure you want to delete a {resource_type}? {confirmTextSuffix}';
      return confirm(confirmText
        .replace('{resource_type}', model.resource_type)
        .replace('{confirmTextSuffix}', confirmTextSuffix));
    } else {
      return confirm('Are you sure? This action cannot be undone.');
    }
  };

  this.applyAction = function(controller, resource, action) {
    var vm = this;
    var promise = (action.method === 'DELETE') ? $http.delete(action.url) : $http.post(action.url);

    function onSuccess(response) {
      if (response.status === 201 || response.status === 202) {
        vm.handleActionSuccess(action);
      } else if (response.status === 204) {
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
    var template = action.successMessage || 'Request to {action} has been accepted';
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

  this.loadNestedActions = function(controller, model, tab) {
    return this.loadActions(model).then(actions => {
      var nestedActions = [];
      angular.forEach(actions, (action, key) => {
        if (action.tab && action.tab === tab) {
          nestedActions.push({
            title: action.title,
            iconClass: action.iconClass,
            callback: this.buttonClick.bind(this, controller, model, key, action),
            disabled: !action.enabled,
            titleAttr: action.reason
          });
        }
      });
      return nestedActions;
    });
  };
}
