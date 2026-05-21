import { FunctionComponent } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceProviderOfferingsUpdateImage,
  marketplaceProviderOfferingsUpdateThumbnail,
} from 'waldur-js-client';

import { formDataOptions } from '@/core/api';
import { FormContainer, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ImageUploadField } from '@/marketplace/offerings/update/ImageUploadField';
import { Offering } from '@/marketplace/types';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { MediaType } from '../update/overview/types';

interface FormData {
  images: any;
}

interface UpdateOfferingMediaProps {
  resolve: {
    offering: Offering;
    refetch: () => void;
    mediaType: MediaType;
  };
}

export const UpdateOfferingMediaDialog: FunctionComponent<
  UpdateOfferingMediaProps
> = (props) => {
  const { mediaType, offering } = props.resolve;

  const submitRequestMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) => {
      if (mediaType === 'thumbnail') {
        return marketplaceProviderOfferingsUpdateThumbnail({
          path: { uuid: offering.uuid },
          body: { thumbnail: formData.images },
          ...formDataOptions,
        });
      } else {
        return marketplaceProviderOfferingsUpdateImage({
          path: { uuid: offering.uuid },
          body: { image: formData.images },
          ...formDataOptions,
        });
      }
    },
    successMessage:
      mediaType === 'thumbnail'
        ? translate('Logo has been updated successfully.')
        : translate('Image has been updated successfully.'),
    errorMessage:
      mediaType === 'thumbnail'
        ? translate('Unable to update logo.')
        : translate('Unable to update image.'),
    refetch: props.resolve.refetch,
  });

  const mediaUrl =
    mediaType === 'thumbnail' ? offering.thumbnail : offering.image;
  const title =
    mediaType === 'thumbnail'
      ? translate('Update logo')
      : translate('Update image');

  return (
    <Form<FormData>
      onSubmit={(values) => submitRequestMutation.mutateAsync(values)}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={title}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  submitting={submitting}
                  label={translate('Save')}
                />
              </>
            }
          >
            {mediaUrl && (
              <img
                src={mediaUrl as string}
                alt={
                  mediaType === 'thumbnail'
                    ? translate('Logo here')
                    : translate('Image here')
                }
                className="img-fluid mb-3"
              />
            )}
            <FormContainer submitting={submitting}>
              <ImageUploadField
                name="images"
                label={translate('Image: ')}
                accept={'image/*'}
                buttonLabel={translate('Browse')}
                className="btn btn-secondary"
                required={true}
              />
            </FormContainer>
          </ModalDialog>
        </form>
      )}
    />
  );
};
