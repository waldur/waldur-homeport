import { FC, useMemo } from 'react';
import { marketplaceResourceApiKeysCreate, Resource } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ALL_MODELS } from '@/marketplace/common/modelSelection';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';

import {
  AssigneeOption,
  getKeyLimitFieldComponents,
  getKeySettingsFields,
  KeySettingsFormValues,
  serializeKeySettings,
  useAssigneeField,
} from './keySettingsFields';
import { KeyComponent } from './types';

// A new key starts on every model its resource allows: unticked, a key
// could call nothing, which is easy to request by accident.
const INITIAL_VALUES = { all_models: true, allowed_models: [] };

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
          user: values.user?.uuid ?? null,
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
