import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { FormContainer, SubmitButton, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { SERVICE_PROVIDER_UPDATE_FORM_ID } from '@waldur/marketplace/offerings/service-providers/constants';
import { updateServiceProviderDescription } from '@waldur/marketplace/offerings/service-providers/store/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

const PureUpdateServiceProviderDescriptionDialog: FunctionComponent<any> = (
  props,
) => (
  <form onSubmit={props.handleSubmit(props.submitRequest)}>
    <ModalDialog
      title={translate('Update {name}', {
        name: props.resolve.serviceProvider.customer_name,
      })}
      footer={
        <>
          <CloseDialogButton />
          <SubmitButton
            disabled={props.invalid}
            submitting={props.submitting}
            label={translate('Save')}
          />
        </>
      }
    >
      <div style={{ paddingBottom: '50px' }}>
        <FormContainer submitting={props.submitting}>
          <TextField
            name="description"
            label={translate('Description')}
            rows={5}
          />
        </FormContainer>
      </div>
    </ModalDialog>
  </form>
);

const mapDispatchToProps = (dispatch, ownProps) => ({
  submitRequest: (formData) =>
    dispatch(
      updateServiceProviderDescription(
        ownProps.resolve.serviceProvider.uuid,
        formData,
      ),
    ),
});

const mapStateToProps = (_state, ownProps) => ({
  initialValues: {
    description: ownProps.resolve.serviceProvider.description,
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);

const enhance = compose(
  connector,
  reduxForm({
    form: SERVICE_PROVIDER_UPDATE_FORM_ID,
  }),
);

export const UpdateServiceProviderDescriptionDialog = enhance(
  PureUpdateServiceProviderDescriptionDialog,
);
