import Axios from 'axios';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import store from '@waldur/store/store';
import { UsersService } from '@waldur/user/UsersService';

import { ActionConfigurationRegistry } from './action-configuration';

// @ngInject
export default function actionUtilsService(
  ncUtilsFlash,
  $rootScope,
  $q,
  $uibModal,
  $injector,
  features,
) {
  this.loadActions = function(model) {
    return UsersService.getCurrentUser().then(user => {
      const config = ActionConfigurationRegistry.getActions(
        model.resource_type,
      );
      if (Array.isArray(config)) {
        return this.parseActions(config, { resource: model, user });
      }
      return Axios.request({ url: model.url, method: 'OPTIONS' }).then(
        response => {
          const order =
            (config && config.order) || Object.keys(response.data.actions);
          const options = (config && config.options) || {};
          return order.reduce((result, name) => {
            const action = angular.merge(
              {},
              response.data.actions[name],
              options[name],
            );
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
        },
      );
    });
  };

  this.parseActions = function(actions, context) {
    const result = {};
    for (const func of actions) {
      const { name, fields, validators, isVisible, ...rest } = func(context);
      if (typeof isVisible === 'boolean' && !isVisible) {
        continue;
      }
      const reason = this.parseValidators(validators, context);
      const url =
        rest.method === 'DELETE' && name !== 'force_destroy'
          ? context.resource.url
          : context.resource.url + name + '/';
      result[name] = {
        ...rest,
        name,
        fields: this.parseFields(fields),
        enabled: !reason,
        reason,
        url,
      };
    }
    return result;
  };

  this.parseValidators = function(validators, context) {
    let reason = '';
    if (validators) {
      for (const validator of validators) {
        reason = validator(context);
        if (reason) {
          return reason;
        }
      }
    }
  };

  this.parseFields = function(fields) {
    if (fields) {
      const options = {};
      for (const field of fields) {
        options[field.name] = field;
      }
      return options;
    }
  };

  this.actionHasToBeAdded = function(action, model, user) {
    if (action.staffOnly && !user.is_staff) {
      return false;
    }

    if (typeof action.isVisible === 'boolean') {
      return !action.isVisible;
    }
    action.isVisible =
      action.isVisible ||
      function() {
        return true;
      };
    if (!action.isVisible(model, UsersService.currentUser)) {
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
    } else if (action.type === 'callback') {
      return action.execute(model);
    }
    return $q.reject();
  };

  this.confirmAction = function(model, name) {
    const custom = ActionConfigurationRegistry.getActions(model.resource_type);
    const confirmTextSuffix = (custom && custom.delete_message) || '';
    if (name === 'destroy') {
      const context = { resourceType: model.resource_type || 'resource' };
      let confirmText =
        model.state === 'Erred'
          ? translate(
              'Are you sure you want to delete a {resourceType} in an Erred state? A cleanup attempt will be performed if you choose so. ',
              context,
            )
          : translate(
              'Are you sure you want to delete a {resourceType}? ',
              context,
            );
      if (confirmTextSuffix) {
        confirmText += confirmTextSuffix;
      }
      return confirm(confirmText);
    } else {
      return confirm(translate('Are you sure? This action cannot be undone.'));
    }
  };

  this.applyAction = function(controller, resource, action) {
    const vm = this;
    const promise =
      action.method === 'DELETE'
        ? Axios.delete(action.url)
        : Axios.post(action.url);

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

    return promise.then(
      onSuccess,
      controller.handleActionException.bind(controller),
    );
  };

  this.handleActionSuccess = function(action) {
    const template =
      action.successMessage ||
      translate('Request to {action} has been accepted.', {
        action: action.title.toLowerCase(),
      });
    ncUtilsFlash.success(template);
    if (action.onSuccess) {
      action.onSuccess($injector);
    } else {
      $rootScope.$broadcast('refreshResource');
    }
  };

  this.openActionDialog = function(controller, resource, name, action) {
    const component = action.component || 'actionDialog';
    const params = { component, size: action.dialogSize };
    if (action.useResolve) {
      Object.assign(params, {
        resolve: {
          action,
          controller,
          resource,
        },
      });
    } else {
      const dialogScope = $rootScope.$new();
      Object.assign(dialogScope, {
        action,
        controller,
        resource,
      });
      params.scope = dialogScope;
    }
    if (typeof component === 'string') {
      $uibModal.open(params).result.then(function() {
        $rootScope.$broadcast('actionApplied', name);
      });
    } else {
      store.dispatch(openModalDialog(component, params));
    }
  };

  this.loadNestedActions = function(controller, model, tab) {
    return this.loadActions(model).then(actions => {
      const nestedActions = [];
      angular.forEach(actions, (action, key) => {
        if (action.tab && action.tab === tab) {
          nestedActions.push({
            title: action.title,
            iconClass: action.iconClass,
            callback: this.buttonClick.bind(
              this,
              controller,
              model,
              key,
              action,
            ),
            disabled: !action.enabled,
            titleAttr: action.reason,
          });
        }
      });
      return nestedActions;
    });
  };
}
