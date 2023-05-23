import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm, formValueSelector } from 'redux-form';

import { required } from '@waldur/core/validators';
import {
  FormContainer,
  StringField,
  SubmitButton,
  TextField,
} from '@waldur/form';
import { ImageField } from '@waldur/form/ImageField';
import { translate } from '@waldur/i18n';
import {
  addOfferingImage,
  isAddingOfferingImage,
} from '@waldur/marketplace/offerings/store/actions';
import { OFFERING_IMAGES_FORM_ID } from '@waldur/marketplace/offerings/store/constants';
import { getOffering } from '@waldur/marketplace/offerings/store/selectors';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { RootState } from '@waldur/store/reducers';

const AddOfferingImageDialog: FunctionComponent<any> = (props) => (
  <form onSubmit={props.handleSubmit(props.submitRequest)}>
    <ModalDialog
      title={translate('Add image')}
      footer={
        <>
          <CloseDialogButton />
          <SubmitButton
            disabled={props.invalid || !props.imagesField}
            submitting={props.isSubmittingImage}
            label={translate('Submit')}
          />
        </>
      }
    >
      <FormContainer submitting={false} clearOnUnmount={false}>
        <ImageField label={translate('Image')} name="images" required />
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

const selector = formValueSelector(OFFERING_IMAGES_FORM_ID);

const mapStateToProps = (state: RootState) => ({
  isSubmittingImage: getOffering(state).isAddingImage,
  imagesField: selector(state, 'images'),
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    submitRequest: (formData) => {
      dispatch(isAddingOfferingImage(true));
      dispatch(addOfferingImage(formData, ownProps.resolve.offering));
    },
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

const enhance = compose(
  connector,
  reduxForm({
    form: OFFERING_IMAGES_FORM_ID,
  }),
);

export const CreateImageDialog = enhance(AddOfferingImageDialog);
