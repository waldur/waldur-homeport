import { PlusCircleIcon } from '@phosphor-icons/react';
import { reduxForm } from 'redux-form';
import { marketplaceScreenshotsCreate } from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@waldur/core/api';
import { required } from '@waldur/core/validators';
import {
  FormContainer,
  StringField,
  SubmitButton,
  TextField,
} from '@waldur/form';
import { ImageField } from '@waldur/form/ImageField';
import { translate } from '@waldur/i18n';
import { OFFERING_IMAGES_FORM_ID } from '@waldur/marketplace/offerings/store/constants';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

export const CreateImageDialog = reduxForm<
  {},
  { resolve: { offering; refetch } }
>({
  form: OFFERING_IMAGES_FORM_ID,
})((props) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();
  const submitRequest = async (formData) => {
    try {
      await marketplaceScreenshotsCreate({
        body: {
          image: fileSerializer(formData.image),
          name: formData.name,
          description: formData.description,
          offering: props.resolve.offering.url,
        },
        ...formDataOptions,
      });
      props.resolve.refetch();
      showSuccess(translate('Image has been added.'));
      closeDialog();
    } catch (error) {
      showErrorResponse(error, translate('Unable to add image.'));
    }
  };
  return (
    <form onSubmit={props.handleSubmit(submitRequest)}>
      <ModalDialog
        title={translate('Add offering image')}
        iconNode={<PlusCircleIcon weight="bold" />}
        iconColor="success"
        footer={
          <>
            <CloseDialogButton className="flex-equal" />
            <SubmitButton
              className="flex-equal btn btn-primary"
              disabled={props.invalid}
              submitting={props.submitting}
              label={translate('Confirm')}
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
            placeholder={translate('e.g. Image name...')}
          />

          <TextField
            name="description"
            label={translate('Description')}
            required={true}
            validate={required}
            maxLength={2000}
            placeholder={translate('Enter a description...')}
          />
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
