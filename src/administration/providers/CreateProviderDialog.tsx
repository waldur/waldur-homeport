import { PlusCircleIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  IdentityProviderRequest,
  identityProvidersCreate,
} from 'waldur-js-client';

import { EDUTEAMS_IDP, TARA_IDP } from '@waldur/auth/providers/constants';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { ProviderForm } from './ProviderForm';

const DEFAULT_LABELS = {
  [EDUTEAMS_IDP]: 'eduTEAMS',
  [TARA_IDP]: 'Riigi Autentimisteenus',
};

const DEFAULT_URLS = {
  [EDUTEAMS_IDP]:
    'https://proxy.myaccessid.org/.well-known/openid-configuration',
  [TARA_IDP]: 'https://tara.ria.ee/.well-known/openid-configuration',
};

export const CreateProviderDialog = (props) => {
  const dispatch = useDispatch();

  const onSubmit = useCallback(
    async (formData: IdentityProviderRequest) => {
      try {
        await identityProvidersCreate({
          body: {
            provider: props.resolve.type,
            ...formData,
          },
        });
        dispatch(
          showSuccess(
            translate('Identity provider has been added successfully.'),
          ),
        );
        if (props.resolve.refetch) await props.resolve.refetch();
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to add identity provider.'),
          ),
        );
      }
    },
    [dispatch, props.resolve],
  );

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={{
        is_active: true,
        verify_ssl: true,
        label: DEFAULT_LABELS[props.resolve.type] || props.resolve.type,
        discovery_url: DEFAULT_URLS[props.resolve.type] || '',
        protected_fields: ['full_name', 'email'],
      }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Add identity provider')}
            iconNode={<PlusCircleIcon weight="bold" />}
            iconColor="success"
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={translate('Add')}
              />
            }
          >
            <ProviderForm />
          </ModalDialog>
        </form>
      )}
    />
  );
};
