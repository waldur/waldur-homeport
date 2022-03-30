import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { FormContainer, SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { UPDATE_OFFERING_LOGO_FORM_ID } from '@waldur/marketplace/offerings/actions/constants';
import { ImageUploadField } from '@waldur/marketplace/offerings/create/ImageUploadField';
import { updateOfferingLogo } from '@waldur/marketplace/offerings/store/constants';
import { Offering } from '@waldur/marketplace/types';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

interface OwnProps {
  resolve: { offering: Offering };
}

export const PureUpdateOfferingLogoDialog: FunctionComponent<any> = (props) => (
  <form onSubmit={props.handleSubmit(props.submitRequest)}>
    <ModalDialog
      title={translate('Update image for {offeringName}', {
        offeringName: props.resolve.offering.name,
      })}
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
      {props.resolve.offering.thumbnail && (
        <img
          src={props.resolve.offering.thumbnail}
          alt={translate('Logo here')}
        />
      )}
      <FormContainer
        submitting={props.submitting}
        labelClass="col-sm-2"
        controlClass="col-sm-8"
      >
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

const mapDispatchToProps = (dispatch, ownProps: OwnProps) => ({
  submitRequest: (formData) =>
    updateOfferingLogo(
      {
        offeringUuid: ownProps.resolve.offering.uuid,
        formData,
      },
      dispatch,
    ),
});

const connector = connect(null, mapDispatchToProps);

const enhance = compose(
  connector,
  reduxForm({
    form: UPDATE_OFFERING_LOGO_FORM_ID,
  }),
);

export const UpdateOfferingLogoDialog = enhance(PureUpdateOfferingLogoDialog);
