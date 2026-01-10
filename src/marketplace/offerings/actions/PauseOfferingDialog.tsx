import { useDispatch } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { marketplaceProviderOfferingsPause } from 'waldur-js-client';

import { FormFooter, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const PauseOfferingDialog = reduxForm<
  { reason },
  { resolve: { offering; refreshOffering } }
>({ form: 'marketplacePauseOffering' })((props) => {
  const dispatch = useDispatch();
  const callback = async (formData) => {
    try {
      await marketplaceProviderOfferingsPause({
        path: { uuid: props.resolve.offering.uuid },
        body: { paused_reason: formData.reason },
      });
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
        footer={<FormFooter submitting={props.submitting} />}
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
