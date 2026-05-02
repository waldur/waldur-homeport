import { PlusCircleIcon } from '@phosphor-icons/react';
import { reduxForm } from 'redux-form';
import { marketplaceScreenshotsCreate } from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@/core/api';
import { required } from '@/core/validators';
import { FormContainer, StringField, SubmitButton, TextField } from '@/form';
import { ImageField } from '@/form/ImageField';
import { translate } from '@/i18n';
import { OFFERING_IMAGES_FORM_ID } from '@/marketplace/offerings/store/constants';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

export const CreateImageDialog = reduxForm<
  {},
  { resolve: { offering; refetch } }
>({
  form: OFFERING_IMAGES_FORM_ID,
})((props) => {
  const submitRequestMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      marketplaceScreenshotsCreate({
        body: {
          image: fileSerializer(formData.image),
          name: formData.name,
          description: formData.description,
          offering: props.resolve.offering.url,
        },
        ...formDataOptions,
      }),
    successMessage: translate('Image has been added.'),
    errorMessage: translate('Unable to add image.'),
    refetch: props.resolve.refetch,
  });
  return (
    <form
      onSubmit={props.handleSubmit((values) =>
        submitRequestMutation.mutateAsync(values),
      )}
    >
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
            maxLength={4096}
            placeholder={translate('Enter a description...')}
          />
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
