import { Form } from 'react-final-form';
import { identityProvidersUpdate, overrideSettings } from 'waldur-js-client';

import { FREEIPA_IDP } from '@/auth/providers/constants';
import { ENV } from '@/core/config';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

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
  const onSubmitMutation = useManagedMutation<any, any, any>({
    mutationFn: async (formData) => {
      if (resolve.type === FREEIPA_IDP) {
        const newSettings = { ...formData };
        delete newSettings.is_active;
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
  });

  return (
    <Form
      onSubmit={(values) => onSubmitMutation.mutateAsync(values)}
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
            closeButton
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
