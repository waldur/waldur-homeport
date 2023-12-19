import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { updateIdentityProvider } from '../api';

import { ProviderForm } from './ProviderForm';

export const UpdateProviderDialog = connect<
  {},
  {},
  { resolve: { provider: { provider } } }
>((_, ownProps) => ({
  initialValues: ownProps.resolve.provider,
}))(
  reduxForm<{}, { resolve: { provider; type; refetch } }>({
    form: 'UpdateProviderDialog',
  })((props) => {
    const dispatch = useDispatch();
    const update = useCallback(
      async (formData) => {
        try {
          await updateIdentityProvider(
            props.resolve.provider.provider,
            formData,
          );
          dispatch(
            showSuccess(
              translate('Identity provider has been updated successfully.'),
            ),
          );
          if (props.resolve.refetch) await props.resolve.refetch();
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
      [dispatch],
    );

    return (
      <form onSubmit={props.handleSubmit(update)}>
        <Modal.Header>
          <Modal.Title>
            {translate('Update identity provider: {provider}', {
              provider: props.resolve.type,
            })}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProviderForm />
        </Modal.Body>
        <Modal.Footer>
          <SubmitButton
            disabled={props.invalid}
            submitting={props.submitting}
            label={translate('Save')}
          />
        </Modal.Footer>
      </form>
    );
  }),
);
