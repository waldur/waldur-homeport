import { Modal } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { reduxForm, SubmissionError } from 'redux-form';

import { uploadLogo } from '@waldur/customer/details/api';
import { CustomerLogoUpdate } from '@waldur/customer/details/CustomerLogoUpdate';
import { FormContainer, SubmitButton, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { updateServiceProvider } from '@waldur/marketplace/common/api';
import { SidebarResizer } from '@waldur/marketplace/offerings/SidebarResizer';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { showError, showSuccess } from '@waldur/store/notify';
import { Customer } from '@waldur/workspace/types';

export const ServiceProviderEditor = connect((_, props: any) => ({
  initialValues: props.resolve.initialValues,
}))(
  reduxForm<{}, any>({
    form: 'ServiceProviderEditor',
  })(({ submitting, invalid, handleSubmit, resolve }) => {
    const dispatch = useDispatch();

    const updateCustomerHandler = async (formData) => {
      try {
        await updateServiceProvider(resolve.uuid, {
          description: formData.description,
        });
        if (formData.image) {
          try {
            await uploadLogo({
              customerUuid: resolve.customer_uuid,
              image: formData.image,
            });
            dispatch(showSuccess(translate('Logo has been uploaded.')));
          } catch (error) {
            throw new SubmissionError({
              _error: translate('Unable to upload logo.'),
            });
          }
        }
        await resolve.refreshServiceProvider();
        dispatch(showSuccess(translate('Service provider has been updated.')));
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(showError(translate('Unable to update service provider.')));
      }
    };

    return (
      <form onSubmit={handleSubmit(updateCustomerHandler)}>
        <SidebarResizer />
        <Modal.Header>
          <Modal.Title>
            {translate('Edit service provider details')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormContainer submitting={submitting}>
            <TextField name="description" label={translate('Description')} />
            <CustomerLogoUpdate
              customer={
                {
                  uuid: resolve.customer_uuid,
                  image: resolve.image,
                } as any as Customer
              }
            />
          </FormContainer>
        </Modal.Body>
        <Modal.Footer>
          <CloseDialogButton />
          <SubmitButton
            disabled={invalid}
            submitting={submitting}
            label={translate('Update')}
          />
        </Modal.Footer>
      </form>
    );
  }),
);
