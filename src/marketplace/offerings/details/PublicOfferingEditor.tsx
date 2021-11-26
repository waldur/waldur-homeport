import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { FormContainer, SubmitButton, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { updateOffering } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { showError, showSuccess } from '@waldur/store/notify';

require('./PublicOfferingEditor.css');

export const PublicOfferingEditor = connect((_, props: any) => ({
  initialValues: props.resolve.initialValues,
}))(
  reduxForm<{}, any>({
    form: 'PublicOfferingEditor',
  })(({ submitting, invalid, handleSubmit, resolve }) => {
    const dispatch = useDispatch();
    const updateOfferingHandler = async (formData) => {
      try {
        await updateOffering(resolve.uuid, {
          description: formData.description,
        });
        await resolve.refreshOffering();
        dispatch(showSuccess(translate('Offering has been updated.')));
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(showError(translate('Unable to update offering.')));
      }
    };

    return (
      <form onSubmit={handleSubmit(updateOfferingHandler)}>
        <ModalHeader>
          <ModalTitle>{translate('Edit offering details')}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <FormContainer layout="vertical" submitting={submitting}>
            <TextField name="description" label={translate('Description')} />
          </FormContainer>
        </ModalBody>
        <ModalFooter>
          <CloseDialogButton />
          <SubmitButton
            disabled={invalid}
            submitting={submitting}
            label={translate('Update')}
          />
        </ModalFooter>
      </form>
    );
  }),
);
