import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { EDUTEAMS_IDP, TARA_IDP } from '@waldur/auth/providers/constants';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { createIdentityProvider } from '../api';

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

export const CreateProviderDialog = connect<{}, {}, { resolve: { type } }>(
  (_, ownProps) => ({
    initialValues: {
      is_active: true,
      verify_ssl: true,
      label: DEFAULT_LABELS[ownProps.resolve.type] || ownProps.resolve.type,
      discovery_url: DEFAULT_URLS[ownProps.resolve.type] || '',
      protected_fields: ['full_name', 'email'],
    },
  }),
)(
  reduxForm<{}, { resolve: { type; refetch } }>({
    form: 'CreateProviderDialog',
  })((props) => {
    const dispatch = useDispatch();
    const update = useCallback(
      async (formData) => {
        try {
          await createIdentityProvider({
            provider: props.resolve.type,
            ...formData,
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
      [dispatch],
    );

    return (
      <form onSubmit={props.handleSubmit(update)}>
        <Modal.Header>
          <Modal.Title>{translate('Add identity provider')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProviderForm />
        </Modal.Body>
        <Modal.Footer>
          <SubmitButton
            disabled={props.invalid}
            submitting={props.submitting}
            label={translate('Add')}
          />
        </Modal.Footer>
      </form>
    );
  }),
);
