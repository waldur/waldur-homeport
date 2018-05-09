import { ENV } from '@waldur/core/services';
import { LATIN_NAME_PATTERN } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { ResourceState } from '@waldur/resource/state/types';

import { ResourceAction, ActionField, ActionContext } from './types';

export function createLatinNameField(): ActionField {
  return {
    name: 'name',
    label: translate('Name'),
    maxlength: 150,
    required: true,
    type: 'string',
    pattern: ENV.enforceLatinName && LATIN_NAME_PATTERN,
  };
}

export function createNameField(): ActionField {
  return {
    name: 'name',
    label: translate('Name'),
    maxlength: 150,
    required: true,
    type: 'string',
  };
}

export function createDescriptionField(): ActionField {
  return {
    name: 'description',
    label: translate('Description'),
    maxlength: 500,
    required: false,
    type: 'text',
  };
}

export function createDefaultEditAction(): ResourceAction {
  return {
    name: 'update',
    title: translate('Edit'),
    type: 'form',
    method: 'PUT',
    successMessage: translate('Resource has been updated.'),
    fields: [
      createNameField(),
      createDescriptionField(),
    ],
  };
}

export function createPullAction(_): ResourceAction {
  return {
    name: 'pull',
    title: translate('Synchronise'),
    method: 'POST',
    type: 'button',
  };
}

export function validateState(state: ResourceState): (ctx: ActionContext) => string {
  return ctx => {
    if (ctx.resource.state !== state) {
      return translate('Resource should be {state}.', {state});
    }
  };
}

export function validateRuntimeState(state: string): (ctx: ActionContext) => string {
  return ctx => {
    if (ctx.resource.runtime_state !== state) {
      return translate('Resource should be {state}.', {state});
    }
  };
}
