import { PlusCircleIcon } from '@phosphor-icons/react';
import { Form } from 'react-final-form';
import {
  IdentityProviderRequest,
  identityProvidersCreate,
} from 'waldur-js-client';

import { EDUTEAMS_IDP, TARA_IDP } from '@/auth/providers/constants';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

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
  const createProviderMutation = useManagedMutation<
    any,
    any,
    IdentityProviderRequest
  >({
    mutationFn: (formData) =>
      identityProvidersCreate({
        body: {
          provider: props.resolve.type,
          ...formData,
        },
      }),
    successMessage: translate('Identity provider has been added successfully.'),
    errorMessage: translate('Unable to add identity provider.'),
    refetch: props.resolve.refetch,
  });

  return (
    <Form<IdentityProviderRequest>
      onSubmit={(values) => createProviderMutation.mutateAsync(values)}
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
