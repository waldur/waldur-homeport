import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { required } from '@waldur/core/validators';
import {
  FormContainer,
  StringField,
  SubmitButton,
  TextField,
} from '@waldur/form-react';
import { translate } from '@waldur/i18n';
import { ImageUploadField } from '@waldur/marketplace/offerings/create/ImageUploadField';
import { addOfferingScreenshot } from '@waldur/marketplace/offerings/store/actions';
import { OFFERING_SCREENSHOTS_FORM_ID } from '@waldur/marketplace/offerings/store/constants';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

const AddOfferingScreenshotDialog = props => (
  <form
    onSubmit={props.handleSubmit(props.submitRequest)}
    className="form-horizontal"
  >
    <ModalDialog
      title={translate('Add screenshot')}
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
      <FormContainer
        submitting={false}
        labelClass="col-sm-2"
        controlClass="col-sm-8"
        clearOnUnmount={false}
      >
        <ImageUploadField
          name="screenshots"
          label={translate('Screenshot: ')}
          accept={'image/*'}
          buttonLabel={translate('Browse')}
          className="btn btn-default"
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
          maxLength={500}
        />
      </FormContainer>
    </ModalDialog>
  </form>
);

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    submitRequest: formData =>
      dispatch(addOfferingScreenshot(formData, ownProps.resolve.offering)),
  };
};

const connector = connect(null, mapDispatchToProps);

const enhance = compose(
  connector,
  reduxForm({
    form: OFFERING_SCREENSHOTS_FORM_ID,
  }),
);

const AddOfferingScreenshotDialogContainer = enhance(
  AddOfferingScreenshotDialog,
);

export default connectAngularComponent(AddOfferingScreenshotDialogContainer, [
  'resolve',
]);
