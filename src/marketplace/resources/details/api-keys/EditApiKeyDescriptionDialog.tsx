import { FC, useMemo } from 'react';
import { marketplaceResourceApiKeysPartialUpdate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';

import { getDescriptionField } from './keySettingsFields';
import { ApiKeyRow } from './types';

interface DescriptionFormValues {
  description?: string;
}

// The description is Waldur's own note: saving it alone sends the agent no
// command and leaves the key's state as it is, on any offering, so it stays
// editable while a command is in flight.
export const EditApiKeyDescriptionDialog: FC<{
  resolve: { row: ApiKeyRow; refetch(): void };
}> = ({ resolve: { row, refetch } }) => {
  // Stable, so re-renders while saving don't reset what the user entered.
  const initialValues = useMemo<DescriptionFormValues>(
    () => ({ description: row.description }),
    [row.description],
  );
  const fields = useMemo(() => [getDescriptionField()], []);

  const mutation = useManagedMutation<any, any, DescriptionFormValues>({
    mutationFn: (values) =>
      marketplaceResourceApiKeysPartialUpdate({
        path: { uuid: row.uuid },
        // The form drops a cleared field; an empty string clears it.
        body: { description: values.description ?? '' },
      }),
    successMessage: translate('API key description saved'),
    errorMessage: translate('Unable to update the API key description.'),
    refetch,
  });

  return (
    <ResourceActionDialog
      dialogTitle={translate('Edit description')}
      dialogSubtitle={
        row.client_id ? (
          <ScopeSubtitle label={translate('Key ID')} name={row.client_id} />
        ) : undefined
      }
      dialogSubmitLabel={translate('Save')}
      disableSubmitWhenPristine
      formFields={fields}
      initialValues={initialValues}
      submitForm={mutation.mutateAsync}
    />
  );
};
