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
import { updateServiceProvider } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { showError, showSuccess } from '@waldur/store/notify';
require('./ServiceProviderEditor.css');

export const ServiceProviderEditor = connect((_, props: any) => ({
  initialValues: props.resolve.initialValues,
}))(
  reduxForm<{}, any>({
    form: 'ServiceProviderEditor',
  })(({ submitting, invalid, handleSubmit, resolve }) => {
    const dispatch = useDispatch();
    const updateCustomerHandler = async (formData) => {
      try {
        await updateServiceProvider(resolve.uuid, formData);
        await resolve.refreshServiceProvider();
        dispatch(showSuccess(translate('Service provider has been updated.')));
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(showError(translate('Unable to update service provider.')));
      }
    };

    return (
      <form onSubmit={handleSubmit(updateCustomerHandler)}>
        <ModalHeader>
          <ModalTitle>{translate('Edit service provider details')}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <FormContainer layout="vertical" submitting={submitting}>
            <TextField name={'description'} label={translate('Description')} />
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
