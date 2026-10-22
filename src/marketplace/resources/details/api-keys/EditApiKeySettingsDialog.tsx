import { FC, useMemo } from 'react';
import {
  marketplaceResourceApiKeysPartialUpdate,
  Resource,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { isAllModels } from '@/marketplace/common/modelSelection';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';

import {
  getKeySettingsFields,
  KeySettingsFormValues,
  serializeKeySettings,
} from './keySettingsFields';
import { ApiKeyRow, KeyComponent } from './types';

// A key's assignee is not among its settings: it is chosen when the key is
// requested and stays until the key is deleted.
export const EditApiKeySettingsDialog: FC<{
  resolve: {
    row: ApiKeyRow;
    resource: Resource;
    components: KeyComponent[];
    models: string[] | null;
    refetch(): void;
  };
}> = ({ resolve: { row, resource, components, models, refetch } }) => {
  // Stable, so re-renders while saving don't reset what the user entered.
  const initialValues = useMemo<KeySettingsFormValues>(
    () => ({
      limits: row.limits ?? {},
      all_models: isAllModels(row.allowed_models),
      // Models the offering has since retired, or the resource no longer
      // allows, are not shown; the key keeps them unless All models replaces
      // its list.
      allowed_models: (row.allowed_models ?? []).filter((model) =>
        models?.includes(model),
      ),
      kept_models: isAllModels(row.allowed_models)
        ? []
        : (row.allowed_models ?? []).filter(
            (model) => !models?.includes(model),
          ),
    }),
    [row, models],
  );

  const fields = useMemo(
    () =>
      getKeySettingsFields(resource, components, models, {
        currentLimits: row.limits,
      }),
    [resource, components, models, row.limits],
  );

  // Limits and models go to the agent as a command, or with the resume of a
  // paused key. The key's state shows which.
  const mutation = useManagedMutation<any, any, KeySettingsFormValues>({
    mutationFn: (values) =>
      marketplaceResourceApiKeysPartialUpdate({
        path: { uuid: row.uuid },
        body: serializeKeySettings(values, components, models),
      }),
    successMessage: translate('API key settings saved'),
    errorMessage: translate('Unable to update the API key settings.'),
    refetch,
  });

  return (
    <ResourceActionDialog
      dialogTitle={translate('Edit key settings')}
      dialogSubtitle={
        <ScopeSubtitle label={translate('Key ID')} name={row.client_id} />
      }
      dialogSubmitLabel={translate('Save')}
      // Saving nothing would issue no command, not even a retry of a failed
      // update: Retry in the row's actions does that.
      disableSubmitWhenPristine
      formFields={fields}
      initialValues={initialValues}
      submitForm={mutation.mutateAsync}
    />
  );
};
