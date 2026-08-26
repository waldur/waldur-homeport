import { PlusCircleIcon } from '@phosphor-icons/react';
import { Form } from 'react-final-form';
import { marketplaceScreenshotsCreate } from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@/core/api';
import { required } from '@/core/validators';
import { ImageGroup, StringGroup, SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';

export const CreateImageDialog = (props: {
  resolve: { offering; refetch };
}) => {
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
    <Form
      onSubmit={(values) =>
        submitRequestMutation.mutateAsync(values).catch(() => {})
      }
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Add offering image')}
            subtitle={
              <ScopeSubtitle
                label={translate('Offering name')}
                name={props.resolve.offering.name}
              />
            }
            iconNode={<PlusCircleIcon weight="bold" />}
            iconColor="success"
            footer={
              <>
                <CloseDialogButton className="flex-equal" />
                <SubmitButton
                  className="flex-equal btn btn-primary"
                  disabled={invalid}
                  submitting={submitting}
                  label={translate('Confirm')}
                />
              </>
            }
          >
            <div className="size-sm">
              <ImageGroup
                label={translate('Image')}
                name="image"
                required
                validate={required}
              />

              <StringGroup
                name="name"
                label={translate('Name')}
                required={true}
                validate={required}
                maxLength={150}
                placeholder={translate('e.g. Image name...')}
                disabled={submitting}
              />

              <TextGroup
                name="description"
                label={translate('Description')}
                required={true}
                validate={required}
                maxLength={4096}
                placeholder={translate('Enter a description...')}
                disabled={submitting}
              />
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
