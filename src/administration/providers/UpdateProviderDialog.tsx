import { useCallback } from 'react';
import { Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { identityProvidersUpdate, overrideSettings } from 'waldur-js-client';

import { FREEIPA_IDP } from '@/auth/providers/constants';
import { ENV } from '@/core/config';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@/store/notify';

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
  const dispatch = useDispatch();

  const onSubmit = useCallback(
    async (formData) => {
      try {
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
        dispatch(
          showSuccess(
            translate('Identity provider has been updated successfully.'),
          ),
        );
        if (resolve.refetch) await resolve.refetch();
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to update identity provider.'),
          ),
        );
      }
    },
    [dispatch, resolve],
  );

  return (
    <Form
      onSubmit={onSubmit}
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
