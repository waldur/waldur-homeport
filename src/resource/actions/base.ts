import { ENV } from '@waldur/core/services';
import { LATIN_NAME_PATTERN } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ResourceState, BaseResource } from '@waldur/resource/types';
import { showSuccess, showErrorResponse } from '@waldur/store/coreSaga';

import { ResourceActionDialog } from './ResourceActionDialog';
import {
  ResourceAction,
  ActionField,
  ActionContext,
  ActionValidator,
} from './types';

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

export function createEditAction<Resource extends BaseResource>({
  fields,
  validators,
  updateResource,
  verboseName,
  resource,
  getInitialValues,
}: {
  fields?: ActionField<Resource>[];
  validators?: ActionValidator<Resource>[];
  updateResource(id: string, formData: any): Promise<any>;
  verboseName: string;
  resource: Resource;
  getInitialValues?(): any;
}): ResourceAction<Resource> {
  return {
    name: 'update',
    title: translate('Edit'),
    type: 'form',
    fields,
    validators,
    component: ResourceActionDialog,
    useResolve: true,
    getInitialValues:
      getInitialValues ||
      (() => ({
        name: resource.name,
        description: resource.description,
      })),
    submitForm: async (dispatch, formData) => {
      try {
        await updateResource(resource.uuid, formData);
        dispatch(
          showSuccess(
            translate('{verboseName} has been updated.', { verboseName }),
          ),
        );
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(
          showErrorResponse(
            e,
            translate('Unable to update {verboseName}.', {
              verboseName,
            }),
          ),
        );
      }
    },
  };
}

export function createPullAction(ctx: ActionContext): ResourceAction {
  return {
    name: 'pull',
    title: translate('Synchronise'),
    method: 'POST',
    type: 'button',
    isVisible: ctx.resource.backend_id !== '',
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
