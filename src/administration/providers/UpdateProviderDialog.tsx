import { omit } from 'es-toolkit';
import { Form } from 'react-final-form';
import { identityProvidersUpdate, overrideSettings } from 'waldur-js-client';

import { FREEIPA_IDP } from '@/auth/providers/constants';
import { ENV } from '@/core/config';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import {
  SETTINGS_CHANGED_QUERIES,
  useLockedReasons,
} from '../settings/useSettingSources';

import { ProviderForm } from './ProviderForm';
import { ProviderFreeIPAForm } from './ProviderFreeIPAForm';

interface UpdateProviderDialogProps {
  resolve: {
    provider: { provider: string };
    type: string;
    refetch?(): void;
  };
}

export const UpdateProviderDialog = ({
  resolve,
}: UpdateProviderDialogProps) => {
  const lockedKeys = Object.keys(useLockedReasons());
  const onSubmitMutation = useManagedMutation<any, any, any>({
    mutationFn: async (formData) => {
      if (resolve.type === FREEIPA_IDP) {
        // The deployment's settings are shown read-only and not sent.
        const newSettings = omit(formData, ['is_active', ...lockedKeys]);
        await overrideSettings({ body: newSettings });
        Object.keys(newSettings).forEach((key) => {
          ENV.plugins.WALDUR_CORE[key] = newSettings[key];
        });
      } else {
        await identityProvidersUpdate({
          path: { provider: resolve.provider.provider },
          body: formData,
        });
      }
    },
    successMessage: translate(
      'Identity provider has been updated successfully.',
    ),
    errorMessage: translate('Unable to update identity provider.'),
    refetch: resolve.refetch,
    invalidateQueries:
      resolve.type === FREEIPA_IDP ? SETTINGS_CHANGED_QUERIES : undefined,
  });

  return (
    <Form
      onSubmit={(values) =>
        onSubmitMutation.mutateAsync(values).catch(() => {})
      }
      initialValues={resolve.provider}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Update identity provider: {provider}', {
              provider: resolve.type,
            })}
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={translate('Save')}
              />
            }
          >
            {resolve.type === FREEIPA_IDP ? (
              <ProviderFreeIPAForm />
            ) : (
              <ProviderForm />
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
