import { FormApi } from 'final-form';
import { FC, useMemo } from 'react';
import {
  marketplaceResourceApiKeysPartialUpdate,
  Resource,
} from 'waldur-js-client';

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
import { ApiKeyRow, KeyComponent } from './types';

interface EditApiKeyFormValues extends KeySettingsFormValues {
  user?: AssigneeOption | null;
}

export const EditApiKeySettingsDialog: FC<{
  resolve: {
    row: ApiKeyRow;
    resource: Resource;
    components: KeyComponent[];
    models: string[];
    refetch(): void;
    // Limits and models change only on a settled key, or on one whose failed
    // command was an update; the assignee changes in any state short of
    // deletion.
    settingsEditable?: boolean;
  };
}> = ({
  resolve: {
    row,
    resource,
    components,
    models,
    refetch,
    settingsEditable = true,
  },
}) => {
  // Stable, so re-renders while saving don't reset what the user entered.
  const initialValues = useMemo<EditApiKeyFormValues>(
    () => ({
      // A nameless account falls back to its id, so an assigned key never
      // reads as unassigned.
      user: row.user_uuid
        ? {
            uuid: row.user_uuid,
            full_name: row.user_full_name || row.user_uuid,
          }
        : null,
      limits: row.limits ?? {},
      allowed_models: (row.allowed_models ?? []).filter((model) =>
        models.includes(model),
      ),
    }),
    [row, models],
  );

  const assigneeField = useAssigneeField(resource);
  const fields = useMemo(
    () => [
      assigneeField,
      ...getKeySettingsFields(resource, components, models, {
        currentLimits: row.limits,
        disabledReason: settingsEditable
          ? undefined
          : translate(
              'Limits and models can be changed once the key is active. The assignee can be changed now.',
            ),
      }),
    ],
    [assigneeField, resource, components, models, row.limits, settingsEditable],
  );

  const mutation = useManagedMutation<
    any,
    any,
    { values: EditApiKeyFormValues; modelsTouched: boolean }
  >({
    mutationFn: ({ values, modelsTouched }) => {
      const user = values.user?.uuid ?? null;
      return marketplaceResourceApiKeysPartialUpdate({
        path: { uuid: row.uuid },
        body: {
          // Sent only when changed: the backend audits every assignee change.
          ...(user !== (row.user_uuid ?? null) ? { user } : {}),
          ...(settingsEditable
            ? serializeKeySettings(values, components, models, modelsTouched)
            : {}),
        },
      });
    },
    // Limits and models go to the agent as a command, or with the resume of a
    // paused key; an assignee change is Waldur's alone. The key's state shows
    // which.
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
      submitForm={(values: EditApiKeyFormValues, form?: FormApi) =>
        mutation.mutateAsync({
          values,
          modelsTouched: Boolean(form?.getState().modified?.allowed_models),
        })
      }
    />
  );
};
