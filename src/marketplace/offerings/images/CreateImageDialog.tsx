import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { required } from '@waldur/core/validators';
import {
  FormContainer,
  StringField,
  SubmitButton,
  TextField,
} from '@waldur/form';
import { ImageField } from '@waldur/form/ImageField';
import { translate } from '@waldur/i18n';
import { uploadOfferingImage } from '@waldur/marketplace/common/api';
import { OFFERING_IMAGES_FORM_ID } from '@waldur/marketplace/offerings/store/constants';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const CreateImageDialog = reduxForm<{}, { resolve: { offering } }>({
  form: OFFERING_IMAGES_FORM_ID,
})((props) => {
  const dispatch = useDispatch();
  const submitRequest = async (formData) => {
    try {
      await uploadOfferingImage(formData, props.resolve.offering);
      dispatch(showSuccess(translate('Image has been added.')));
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to add image.')));
    }
  };
  return (
    <form onSubmit={props.handleSubmit(submitRequest)}>
      <ModalDialog
        title={translate('Add image')}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={translate('Submit')}
            />
          </>
        }
      >
        <FormContainer submitting={props.submitting}>
          <ImageField
            label={translate('Image')}
            name="image"
            required
            validate={required}
          />
          <StringField
            name="name"
            label={translate('Name')}
            required={true}
            validate={required}
            maxLength={150}
          />
          <TextField
            name="description"
            label={translate('Description')}
            required={true}
            validate={required}
            maxLength={2000}
          />
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
