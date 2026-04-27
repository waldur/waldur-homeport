import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { InjectedFormProps, reduxForm } from 'redux-form';
import {
  marketplaceProviderOfferingsUpdateImage,
  marketplaceProviderOfferingsUpdateThumbnail,
} from 'waldur-js-client';

import { formDataOptions } from '@/core/api';
import { FormContainer, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { UPDATE_OFFERING_MEDIA_FORM_ID } from '@/marketplace/offerings/actions/constants';
import { ImageUploadField } from '@/marketplace/offerings/update/ImageUploadField';
import { Offering } from '@/marketplace/types';
import { closeModalDialog } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@/store/notify';

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

type PureUpdateOfferingMediaDialogProps = InjectedFormProps<
  FormData,
  UpdateOfferingMediaProps
> &
  UpdateOfferingMediaProps;

const PureUpdateOfferingMediaDialog: FunctionComponent<
  PureUpdateOfferingMediaDialogProps
> = (props) => {
  const dispatch = useDispatch();
  const { mediaType, offering } = props.resolve;

  const submitRequest = async (formData) => {
    try {
      if (mediaType === 'thumbnail') {
        await marketplaceProviderOfferingsUpdateThumbnail({
          path: { uuid: offering.uuid },
          body: { thumbnail: formData.images },
          ...formDataOptions,
        });
        dispatch(showSuccess(translate('Logo has been updated successfully.')));
      } else {
        await marketplaceProviderOfferingsUpdateImage({
          path: { uuid: offering.uuid },
          body: { image: formData.images },
          ...formDataOptions,
        });
        dispatch(
          showSuccess(translate('Image has been updated successfully.')),
        );
      }

      props.resolve.refetch();
      dispatch(closeModalDialog());
    } catch (error) {
      const errorMessage =
        mediaType === 'thumbnail'
          ? translate('Unable to update logo.')
          : translate('Unable to update image.');
      dispatch(showErrorResponse(error, errorMessage));
    }
  };

  const mediaUrl =
    mediaType === 'thumbnail' ? offering.thumbnail : offering.image;
  const title =
    mediaType === 'thumbnail'
      ? translate('Update logo')
      : translate('Update image');

  return (
    <form onSubmit={props.handleSubmit(submitRequest)}>
      <ModalDialog
        title={title}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton
              submitting={props.submitting}
              label={translate('Save')}
            />
          </>
        }
      >
        {mediaUrl && (
          <img
            src={mediaUrl}
            alt={
              mediaType === 'thumbnail'
                ? translate('Logo here')
                : translate('Image here')
            }
            className="img-fluid mb-3"
          />
        )}
        <FormContainer submitting={props.submitting}>
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
  );
};

const enhance = reduxForm({
  form: UPDATE_OFFERING_MEDIA_FORM_ID,
});

export const UpdateOfferingMediaDialog = enhance(PureUpdateOfferingMediaDialog);
