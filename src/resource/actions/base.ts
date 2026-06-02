import { CoreStates as ResourceState } from 'waldur-js-client';
import { ResourceState as MarketplaceResourceState } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { LATIN_NAME_PATTERN } from '@/core/utils';
import { translate } from '@/i18n';

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
    maxlength: 4096,
    required: false,
    type: 'text',
    // Preserve "" so clearing the field sends an explicit empty string to the
    // backend; react-final-form's default parse would otherwise drop the key
    // from the PUT body and the backend would leave the old value in place.
    parse: (value) => value ?? '',
  };
}

export function validateState(
  ...validStates: (ResourceState | MarketplaceResourceState)[]
): (ctx: ActionContext) => string {
  return (ctx) => {
    if (
      !validStates
        .map((state) => state.toLowerCase())
        .includes(ctx.resource.state.toLowerCase())
    ) {
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
