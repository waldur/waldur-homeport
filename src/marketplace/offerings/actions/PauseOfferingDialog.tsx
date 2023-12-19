import { useDispatch } from 'react-redux';
import { reduxForm, Field } from 'redux-form';

import { SubmitButton, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { updateOfferingState } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const PauseOfferingDialog = reduxForm<
  { reason },
  { resolve: { offering; refreshOffering } }
>({ form: 'marketplacePauseOffering' })((props) => {
  const dispatch = useDispatch();
  const callback = async (formData) => {
    try {
      await updateOfferingState(
        props.resolve.offering.uuid,
        'pause',
        formData.reason,
      );
      if (props.resolve.refreshOffering) {
        props.resolve.refreshOffering();
      }
      dispatch(showSuccess(translate('Offering has been paused.')));
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to pause offering.')),
      );
    }
  };
  return (
    <form onSubmit={props.handleSubmit(callback)}>
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
          component={TextField}
          as="textarea"
          placeholder={translate(
            'Please enter reason why offering has been paused.',
          )}
          rows={7}
        />
      </ModalDialog>
    </form>
  );
});
