import { FC, useMemo } from 'react';
import { marketplaceResourceApiKeysCreate, Resource } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ALL_MODELS } from '@/marketplace/common/modelSelection';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';

import {
  AssigneeOption,
  assigneeUuid,
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
  user?: AssigneeOption | null;
}

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
    errorMessage: translate('Unable to request the API key.'),
    refetch,
  });

  const fields = useMemo(
    () => [
      assigneeField,
      ...getKeySettingsFields(resource, components, models),
    ],
    [assigneeField, resource, components, models],
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
      submitForm={mutation.mutateAsync}
    />
  );
};
