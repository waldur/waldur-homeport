import { FC, useCallback, useMemo } from 'react';
import { useField } from 'react-final-form';
import {
  marketplaceResourceApiKeysPartialUpdate,
  Resource,
} from 'waldur-js-client';

import { FieldWarning } from '@/form/FieldWarning';
import { translate } from '@/i18n';
import { isAllModels } from '@/marketplace/common/modelSelection';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { useNotify } from '@/store/notify';

import {
  AssigneeOption,
  getKeyLimitFieldComponents,
  getKeySettingsFields,
  KeySettingsFormValues,
  serializeKeySettings,
  useAssigneeField,
} from './keySettingsFields';
import { getAssigneeLock } from './state';
import { ApiKeyRow, KeyComponent } from './types';
import { useInvalidateRevealedKey } from './useResourceApiKeys';

interface EditApiKeyFormValues extends KeySettingsFormValues {
  user?: AssigneeOption | null;
}

const getAssigneeUuid = (values: EditApiKeyFormValues) =>
  values.user?.uuid ?? null;

// Shown under the assignee once it differs from the key's: saving rotates the
// key, so its current value is about to stop working.
const RotationWarning: FC<{ initialAssignee: string | null }> = ({
  initialAssignee,
}) => {
  const user = useField<AssigneeOption | null>('user', {
    subscription: { value: true },
  }).input.value;
  return (user?.uuid ?? null) !== initialAssignee ? (
    <div className="mb-5">
      <FieldWarning
        error={translate(
          'Saving rotates this key. Anything using the current value will stop working.',
        )}
      />
    </div>
  ) : null;
};

export const EditApiKeySettingsDialog: FC<{
  resolve: {
    row: ApiKeyRow;
    resource: Resource;
    components: KeyComponent[];
    models: string[] | null;
    refetch(): void;
    // Limits and models change only on a settled key, or on one whose failed
    // command was an update. The assignee follows getAssigneeLock.
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
      spending_limits: row.spending_limits ?? {},
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

  const initialAssignee = row.user_uuid ?? null;
  // A key that holds a secret changes hands by rotation (the dialog opens
  // only where the offering manages keys).
  const rotates = Boolean(row.client_id);
  const assigneeLock = getAssigneeLock(row);

  const assigneeField = useAssigneeField(resource);
  const limitComponents = useMemo(
    () => getKeyLimitFieldComponents(resource, components, row.spending_limits),
    [resource, components, row.spending_limits],
  );
  const fields = useMemo(
    () => [
      {
        ...assigneeField,
        ...(rotates
          ? {
              help_text: translate(
                'Changing the assignee rotates the key: its current value stops working and the new assignee reveals a new one.',
              ),
            }
          : {}),
        disabled: Boolean(assigneeLock),
        disabled_tooltip: assigneeLock,
      },
      ...(rotates
        ? [
            {
              name: 'user_rotation_warning',
              component: RotationWarning,
              extraProps: { initialAssignee },
            },
          ]
        : []),
      ...getKeySettingsFields(resource, components, models, {
        currentLimits: row.spending_limits,
        disabledReason: settingsEditable
          ? undefined
          : translate(
              'Limits and models can be changed once the key is active. The assignee can be changed now.',
            ),
      }),
    ],
    [
      assigneeField,
      rotates,
      assigneeLock,
      initialAssignee,
      resource,
      components,
      models,
      row.spending_limits,
      settingsEditable,
    ],
  );

  const { showSuccess } = useNotify();
  const invalidateReveal = useInvalidateRevealedKey();
  const mutation = useManagedMutation<any, any, EditApiKeyFormValues>({
    mutationFn: (values) => {
      const user = getAssigneeUuid(values);
      return marketplaceResourceApiKeysPartialUpdate({
        path: { uuid: row.uuid },
        body: {
          // Sent only when changed: on a key that holds a secret, a change
          // rotates it.
          ...(user !== initialAssignee ? { user } : {}),
          ...(settingsEditable
            ? serializeKeySettings(values, limitComponents, models)
            : {}),
        },
      });
    },
    // Limits and models go to the agent as a command, or with the resume of a
    // paused key. A new assignee on a key that holds a secret goes as a
    // rotation, which carries them too; on one that holds none it is
    // Waldur's alone. The key's state shows which.
    onSuccess: (_data, values) => {
      const rotated = rotates && getAssigneeUuid(values) !== initialAssignee;
      if (rotated) {
        // The old value is about to stop working, and the new assignee
        // reveals the new one.
        invalidateReveal(row.uuid);
      }
      showSuccess(
        rotated
          ? translate('API key settings saved; rotation requested')
          : translate('API key settings saved'),
      );
    },
    errorMessage: translate('Unable to update the API key settings.'),
    refetch,
  });

  // A refused assignee (a second key for the same person, or a key that
  // cannot be rotated now) is shown on the field, not only in the toast.
  const submitForm = useCallback(
    async (values: EditApiKeyFormValues) => {
      try {
        await mutation.mutateAsync(values);
      } catch (error) {
        const userError = (error as any)?.response?.data?.user;
        if (userError) {
          return { user: userError };
        }
      }
    },
    [mutation.mutateAsync],
  );

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
      submitForm={submitForm}
    />
  );
};
