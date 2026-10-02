import { FC, useMemo } from 'react';
import { marketplaceResourceApiKeysCreate, Resource } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';

import {
  AssigneeOption,
  getKeySettingsFields,
  KeySettingsFormValues,
  serializeKeySettings,
  useAssigneeField,
} from './keySettingsFields';
import { KeyComponent } from './types';

const INITIAL_VALUES = { allowed_models: [] };

interface RequestApiKeyFormValues extends KeySettingsFormValues {
  user?: AssigneeOption | null;
}

export const RequestApiKeyDialog: FC<{
  resolve: {
    resource: Resource;
    components: KeyComponent[];
    models: string[];
    refetch(): void;
  };
}> = ({ resolve: { resource, components, models, refetch } }) => {
  const assigneeField = useAssigneeField(resource);

  const mutation = useManagedMutation<any, any, RequestApiKeyFormValues>({
    mutationFn: (values) =>
      marketplaceResourceApiKeysCreate({
        body: {
          resource: resource.uuid,
          // An unassigned key is shared: any member of the project or its
          // organization can reveal it.
          user: values.user?.uuid ?? null,
          ...serializeKeySettings(values, components, models),
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
