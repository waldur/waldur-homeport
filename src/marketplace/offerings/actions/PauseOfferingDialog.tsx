import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { InjectedFormProps, reduxForm, Field } from 'redux-form';

import { SubmitButton } from '@waldur/form-react';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

import { updateOfferingState } from '../store/actions';

const mapDispatchToProps = (dispatch, ownProps) => ({
  submitRequest: formData =>
    dispatch(
      updateOfferingState(ownProps.resolve.offering, 'pause', formData.reason),
    ),
});

const connector = compose(
  reduxForm({ form: 'marketplacePauseOffering' }),
  connect(null, mapDispatchToProps),
);

interface PauseOfferingDialogProps extends InjectedFormProps {
  submitRequest(formData: any): void;
}

export const PauseOfferingDialog = connector(
  (props: PauseOfferingDialogProps) => (
    <form onSubmit={props.handleSubmit(props.submitRequest)}>
      <ModalDialog
        title={translate('Pause offering')}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton
              submitting={props.submitting}
              label={translate('Submit')}
            />
          </>
        }
      >
        <Field
          name="reason"
          className="form-control"
          component="textarea"
          placeholder={translate(
            'Please enter reason why offering has been paused.',
          )}
          rows={7}
        />
      </ModalDialog>
    </form>
  ),
);

export default connectAngularComponent(PauseOfferingDialog, ['resolve']);
