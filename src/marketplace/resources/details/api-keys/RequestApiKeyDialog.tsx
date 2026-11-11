import { FC, useCallback, useMemo } from 'react';
import { marketplaceResourceApiKeysCreate, Resource } from 'waldur-js-client';

import { getErrorBody } from '@/core/ErrorMessageFormatter';
import { getErrorStatus } from '@/error/utils';
import { translate } from '@/i18n';
import { ALL_MODELS } from '@/marketplace/common/modelSelection';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { useNotify } from '@/store/notify';

import {
  AssigneeOption,
  assigneeUuid,
  getDescriptionField,
  getKeyLimitFieldComponents,
  getKeySettingsFields,
  KeySettingsFormValues,
  PROJECT_KEY_OPTION,
  serializeKeySettings,
  useAssigneeField,
} from './keySettingsFields';
import { KeyComponent } from './types';

// A new key starts on every model its resource allows: unticked, a key
// could call nothing, which is easy to request by accident. It starts as a
// project key, shown as such, so a personal key is the deliberate choice.
const INITIAL_VALUES = {
  all_models: true,
  allowed_models: [],
  user: PROJECT_KEY_OPTION,
};

interface RequestApiKeyFormValues extends KeySettingsFormValues {
  description?: string;
  user?: AssigneeOption | null;
}

/**
 * The errors of a 400 response, when every one of them names a field of the
 * form; otherwise undefined, so that none is lost from view.
 */
const getFieldErrors = (
  error: any,
  fieldNames: string[],
): Record<string, unknown> | undefined => {
  const data = getErrorStatus(error) === 400 ? getErrorBody(error) : undefined;
  if (!data || Array.isArray(data)) return;
  const keys = Object.keys(data);
  return keys.length && keys.every((key) => fieldNames.includes(key))
    ? data
    : undefined;
};

export const RequestApiKeyDialog: FC<{
  resolve: {
    resource: Resource;
    components: KeyComponent[];
    models: string[] | null;
    refetch(): void;
  };
}> = ({ resolve: { resource, components, models, refetch } }) => {
  const assigneeField = useAssigneeField(resource);
  const limitComponents = useMemo(
    () => getKeyLimitFieldComponents(resource, components),
    [resource, components],
  );

  const mutation = useManagedMutation<any, any, RequestApiKeyFormValues>({
    mutationFn: (values) =>
      marketplaceResourceApiKeysCreate({
        body: {
          resource: resource.uuid,
          ...(values.description ? { description: values.description } : {}),
          // An unassigned key is shared: any member of the project or its
          // organization can reveal it.
          user: assigneeUuid(values.user),
          // Without a model list there is no Models field to choose in, and
          // a key requested with no models could call nothing.
          ...(models ? {} : { allowed_models: [ALL_MODELS] }),
          ...serializeKeySettings(values, limitComponents, models),
        },
      }),
    successMessage: translate('API key requested'),
    refetch,
  });
  const { showErrorResponse } = useNotify();

  const fields = useMemo(
    () => [
      getDescriptionField(),
      assigneeField,
      ...getKeySettingsFields(resource, components, models),
    ],
    [assigneeField, resource, components, models],
  );

  // A refusal of a field's value, such as a member who already holds a key
  // on the resource, is shown under that field, which the person changes to
  // try again. Anything else is a toast. Either way the rejection ends here:
  // the form does not catch it.
  const submitForm = useCallback(
    async (values: RequestApiKeyFormValues) => {
      try {
        await mutation.mutateAsync(values);
      } catch (error) {
        const fieldErrors = getFieldErrors(
          error,
          fields.map((field) => field.name),
        );
        if (!fieldErrors) {
          showErrorResponse(error, translate('Unable to request the API key.'));
        }
        return fieldErrors;
      }
    },
    [mutation.mutateAsync, fields, showErrorResponse],
  );

  return (
    <ResourceActionDialog
      dialogTitle={translate('Request API key')}
      dialogSubtitle={
        <ScopeSubtitle
          label={translate('Resource name')}
          name={resource.name}
        />
      }
      formFields={fields}
      initialValues={INITIAL_VALUES}
      submitForm={submitForm}
    />
  );
};
