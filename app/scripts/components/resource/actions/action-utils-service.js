// @ngInject
export default function actionUtilsService(
  ncUtilsFlash, $rootScope, $http, $q, $uibModal, $injector, ncUtils, features,
  resourcesService, ActionConfiguration, ActionResourceLoader, coreUtils, usersService) {
  this.loadActions = function(model) {
    resourcesService.cleanOptionsCache(model.url);
    return usersService.getCurrentUser().then(user => {
      return resourcesService.getOption(model.url).then(response => {
        const config = ActionConfiguration[model.resource_type];
        const order = config && config.order || Object.keys(response.actions);
        const options = config && config.options || {};
        return order.reduce((result, name) => {
          let action = angular.merge({}, response.actions[name], options[name]);
          if (this.actionHasToBeAdded(action, model, user)) {
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
    });
  };

  this.actionHasToBeAdded = function(action, model, user) {
    if (action.staffOnly && !user.is_staff) {
      return false;
    }

    action.isVisible = action.isVisible || function () {return true;};
    if (!action.isVisible(model, usersService.currentUser)) {
      return false;
    }

    if (action.feature && !features.isVisible(action.feature)) {
      return false;
    }

    return action.hasOwnProperty('enabled');
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
      let confirmText = (model.state === 'Erred')
        ?  coreUtils.templateFormatter(gettext('Are you sure you want to delete a {resourceType} in an Erred state? A cleanup attempt will be performed if you choose so. {confirmTextSuffix}.'),
          { resourceType: model.resource_type, confirmTextSuffix: confirmTextSuffix })
        : coreUtils.templateFormatter(gettext('Are you sure you want to delete a {resourceType}? {confirmTextSuffix}.'),
        { resourceType: model.resource_type, confirmTextSuffix: confirmTextSuffix });
      return confirm(confirmText);
    } else {
      return confirm(gettext('Are you sure? This action cannot be undone.'));
    }
  };

  this.applyAction = function(controller, resource, action) {
    let vm = this;
    let promise = (action.method === 'DELETE') ? $http.delete(action.url) : $http.post(action.url);

    function onSuccess(response) {
      if (response.status === 201 || response.status === 202) {
        if (response.config.method === 'DELETE') {
          $rootScope.$broadcast('resourceDeletion');
        }
        vm.handleActionSuccess(action);
      } else if (response.status === 204) {
        ncUtilsFlash.success(gettext('Resource has been deleted.'));
        controller.afterInstanceRemove(resource);
      } else {
        vm.handleActionSuccess(action);
        return controller.reInitResource(resource);
      }

      if ('pollResource' in controller) {
        // trigger polling if it is possible.
        controller.pollResource(resource);
      }
    }

    return promise.then(onSuccess, controller.handleActionException.bind(controller));
  };

  this.handleActionSuccess = function(action) {
    let template = action.successMessage ||
        coreUtils.templateFormatter(gettext('Request to {action} has been accepted.'), { action: action.title.toLowerCase() });
    ncUtilsFlash.success(template);
    if (action.onSuccess) {
      action.onSuccess($injector);
    }
  };

  this.openActionDialog = function(controller, resource, name, action) {
    let component = action.component || 'actionDialog';
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
      let dialogScope = $rootScope.$new();
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
      let nestedActions = [];
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
