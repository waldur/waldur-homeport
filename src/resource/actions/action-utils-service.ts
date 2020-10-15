import Axios from 'axios';

import { $rootScope, $q, ngInjector } from '@waldur/core/services';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { showSuccess } from '@waldur/store/coreSaga';
import store from '@waldur/store/store';
import { UsersService } from '@waldur/user/UsersService';
import { getUser } from '@waldur/workspace/selectors';

import { ActionConfigurationRegistry } from './action-configuration';

const parseValidators = (validators, context) => {
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

const parseFields = (fields) => {
  if (fields) {
    const options = {};
    for (const field of fields) {
      options[field.name] = field;
    }
    return options;
  }
};

const parseActions = (actions, context) => {
  const result = {};
  for (const func of actions) {
    const { name, fields, validators, isVisible, ...rest } = func(context);
    if (typeof isVisible === 'boolean' && !isVisible) {
      continue;
    }
    const reason = parseValidators(validators, context);
    const url =
      rest.method === 'DELETE' && name !== 'force_destroy'
        ? context.resource.url
        : context.resource.url + name + '/';
    result[name] = {
      ...rest,
      name,
      fields: parseFields(fields),
      enabled: !reason,
      reason,
      url,
    };
  }
  return result;
};

const actionHasToBeAdded = (action, model, user) => {
  if (action.staffOnly && !user.is_staff) {
    return false;
  }

  if (typeof action.isVisible === 'boolean') {
    return !action.isVisible;
  }
  action.isVisible =
    action.isVisible ||
    function () {
      return true;
    };
  if (!action.isVisible(model, getUser(store.getState()))) {
    return false;
  }

  if (action.feature && !isFeatureVisible(action.feature)) {
    return false;
  }

  return action.hasOwnProperty('enabled');
};

const confirmAction = (model, name) => {
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

export const handleActionSuccess = (action) => {
  const template =
    action.successMessage ||
    translate('Request to {action} has been accepted.', {
      action: action.title.toLowerCase(),
    });
  store.dispatch(showSuccess(template));
  if (action.onSuccess) {
    action.onSuccess(ngInjector);
  } else {
    $rootScope.$broadcast('refreshResource');
  }
};

const applyAction = (controller, resource, action) => {
  const promise =
    action.method === 'DELETE'
      ? Axios.delete(action.url)
      : Axios.post(action.url);

  function onSuccess(response) {
    if (response.status === 201 || response.status === 202) {
      if (response.config.method === 'DELETE') {
        $rootScope.$broadcast('resourceDeletion');
      }
      handleActionSuccess(action);
    } else if (response.status === 204) {
      store.dispatch(showSuccess(translate('Resource has been deleted.')));
      controller.afterInstanceRemove(resource);
    } else {
      handleActionSuccess(action);
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

const openActionDialog = (controller, resource, name, action) => {
  const component = action.component || 'actionDialog';
  const params = { component, size: action.dialogSize, scope: undefined };
  if (action.useResolve) {
    Object.assign(params, {
      resolve: {
        action,
        controller,
        resource,
      },
      formId: action.formId,
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
    ngInjector
      .get('$uibModal')
      .open(params)
      .result.then(function () {
        $rootScope.$broadcast('actionApplied', name);
      });
  } else {
    store.dispatch(openModalDialog(component, params));
  }
};

export const buttonClick = (controller, model, name, action) => {
  if (action.type === 'button') {
    if (!action.destructive || confirmAction(model, name)) {
      return applyAction(controller, model, action);
    }
  } else if (action.type === 'form') {
    openActionDialog(controller, model, name, action);
    return $q.when(true);
  } else if (action.type === 'callback') {
    return action.execute(model);
  }
  return $q.reject();
};

export const loadActions = (model) => {
  return UsersService.getCurrentUser().then((user) => {
    const config = ActionConfigurationRegistry.getActions(model.resource_type);
    if (Array.isArray(config)) {
      return parseActions(config, { resource: model, user });
    }
    return Axios.request({ url: model.url, method: 'OPTIONS' }).then(
      (response) => {
        const order =
          (config && config.order) || Object.keys(response.data.actions);
        const options = (config && config.options) || {};
        return order.reduce((result, name) => {
          const action = {
            ...response.data.actions[name],
            ...options[name],
            fields: {
              ...response.data.actions[name]?.fields,
              ...options[name]?.fields,
            },
          };
          if (actionHasToBeAdded(action, model, user)) {
            result[name] = action;
          }
          if (action.fields) {
            Object.keys(action.fields).forEach((name) => {
              const field = action.fields[name];
              field.name = name;
            });
          }
          return result;
        }, {});
      },
    );
  });
};

export const loadNestedActions = (controller, model, tab) => {
  return loadActions(model).then((actions) => {
    const nestedActions = [];
    Object.keys(actions).forEach((key) => {
      const action = actions[key];
      if (action.tab && action.tab === tab) {
        nestedActions.push({
          title: action.title,
          iconClass: action.iconClass,
          callback: () => buttonClick(controller, model, key, action),
          disabled: !action.enabled,
          titleAttr: action.reason,
        });
      }
    });
    return nestedActions;
  });
};
