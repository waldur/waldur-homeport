import { ENV } from '@waldur/configs/default';
import { LATIN_NAME_PATTERN } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { ResourceState } from '@waldur/resource/types';

import { ActionField, ActionContext } from './types';

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

export function createNameField<R>(): ActionField<R> {
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
    maxlength: 2000,
    required: false,
    type: 'text',
  };
}

export function validateState(
  ...validStates: ResourceState[]
): (ctx: ActionContext) => string {
  return (ctx) => {
    if (!validStates.includes(ctx.resource.state)) {
      return translate('Valid states for operation: {validStates}.', {
        validStates: validStates.join(', '),
      });
    }
  };
}

export function validateRuntimeState(
  ...validStates: string[]
): (ctx: ActionContext) => string {
  return (ctx) => {
    if (!validStates.includes(ctx.resource.runtime_state)) {
      return translate('Valid runtime states for operation: {validStates}.', {
        validStates: validStates.join(', '),
      });
    }
  };
}
