// @ngInject
export default function actionUtilsService(
  ncUtilsFlash, $rootScope, HttpUtils, $http, $q, $uibModal, $filter, ncUtils,
  resourcesService, ActionConfiguration, coreUtils) {
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
        ?  coreUtils.templateFormatter(gettext(`Are you sure you want to delete a {resourceType} in an Erred state? 
        A cleanup attempt will be performed if you choose so. {confirmTextSuffix}`),
          { resourceType: model.resource_type, confirmTextSuffix: confirmTextSuffix })
        : coreUtils.templateFormatter(gettext('Are you sure you want to delete a {resourceType}? {confirmTextSuffix}'),
        { resourceType: model.resource_type, confirmTextSuffix: confirmTextSuffix });
      return confirm(confirmText
        .replace('{resource_type}', model.resource_type)
        .replace('{confirmTextSuffix}', confirmTextSuffix));
    } else {
      return confirm(gettext('Are you sure? This action cannot be undone.'));
    }
  };

  this.applyAction = function(controller, resource, action) {
    var vm = this;
    var promise = (action.method === 'DELETE') ? $http.delete(action.url) : $http.post(action.url);

    function onSuccess(response) {
      if (response.status === 201 || response.status === 202) {
        if (response.config.method === 'DELETE') {
          $rootScope.$broadcast('resourceDeletion');
        }
        vm.handleActionSuccess(action);
      } else if (response.status === 204) {
        ncUtilsFlash.success(gettext('Resource has been deleted'));
        controller.afterInstanceRemove(resource);
      } else {
        vm.handleActionSuccess(action);
        return controller.reInitResource(resource);
      }
    }

    return promise.then(onSuccess, controller.handleActionException.bind(controller));
  };

  this.handleActionSuccess = function(action) {
    var template = action.successMessage ||
        coreUtils.templateFormatter(gettext('Request to {action} has been accepted'), { action: action.title.toLowerCase() });
    ncUtilsFlash.success(template);
  };

  this.openActionDialog = function(controller, resource, name, action) {
    var component = action.component || 'actionDialog';
    const params = {component, size: action.dialogSize};
    if (action.useResolve) {
      angular.extend(params, {
        resolve: {
          action: () => action,
          controller: () => controller,
          resource: () => resource,
        }
      });
    } else {
      var dialogScope = $rootScope.$new();
      angular.extend(dialogScope, {
        action,
        controller,
        resource
      });
      params.scope = dialogScope;
    }
    $uibModal.open(params).result.then(function() {
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
