import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Field, reduxForm } from 'redux-form';

import { required } from '@waldur/core/validators';
import { StringField, SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { createOfferingEndpoint } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { FormGroup } from '../../FormGroup';

import { ENDPOINT_FORM_ID } from './constants';

export const AddEndpointDialog = reduxForm<
  {},
  { resolve: { offering; refetch } }
>({
  form: ENDPOINT_FORM_ID,
})((props) => {
  const dispatch = useDispatch();
  const update = useCallback(
    async (formData) => {
      try {
        await createOfferingEndpoint(props.resolve.offering.uuid, formData);
        dispatch(
          showSuccess(translate('Endpoint has been added successfully.')),
        );
        if (props.resolve.refetch) await props.resolve.refetch();
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Unable to add endpoint.')),
        );
      }
    },
    [dispatch],
  );

  return (
    <form onSubmit={props.handleSubmit(update)}>
      <Modal.Header>
        <Modal.Title>{translate('Add endpoint')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormGroup label={translate('Name')} required={true}>
          <Field name="name" validate={required} component={StringField} />
        </FormGroup>
        <FormGroup label={translate('URL')} required={true}>
          <Field name="url" validate={required} component={StringField} />
        </FormGroup>
      </Modal.Body>
      <Modal.Footer>
        <SubmitButton
          disabled={props.invalid}
          submitting={props.submitting}
          label={translate('Create')}
        />
      </Modal.Footer>
    </form>
  );
});
