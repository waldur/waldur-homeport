import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { CustomerLogoUpdateContainer } from '@waldur/customer/details/CustomerLogoUpdateContainer';
import { uploadLogo } from '@waldur/customer/details/store/api';
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
          await uploadLogo({
            customerUuid: resolve.customer_uuid,
            image: formData.image,
          });
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
        <ModalHeader>
          <ModalTitle>{translate('Edit service provider details')}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <FormContainer layout="vertical" submitting={submitting}>
            <TextField name={'description'} label={translate('Description')} />
            <CustomerLogoUpdateContainer
              customer={
                {
                  uuid: resolve.customer_uuid,
                  image: resolve.image,
                } as any as Customer
              }
            />
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
