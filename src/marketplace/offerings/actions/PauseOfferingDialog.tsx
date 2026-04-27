import { FunctionComponent, useCallback } from 'react';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { marketplaceProviderOfferingsPause } from 'waldur-js-client';

import { SubmitButton, TextField } from '@/form';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { closeModalDialog } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@/store/notify';

export const PauseOfferingDialog: FunctionComponent<{
  resolve: { offering; refreshOffering };
}> = ({ resolve: { offering, refreshOffering } }) => {
  const dispatch = useDispatch();

  const onSubmit = useCallback(
    async (formData) => {
      try {
        await marketplaceProviderOfferingsPause({
          path: { uuid: offering.uuid },
          body: { paused_reason: formData.reason },
        });
        if (refreshOffering) {
          refreshOffering();
        }
        dispatch(showSuccess(translate('Offering has been paused.')));
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Unable to pause offering.')),
        );
      }
    },
    [dispatch, offering, refreshOffering],
  );

  return (
    <Form
      onSubmit={onSubmit}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Pause offering')}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  submitting={submitting}
                  label={translate('Pause')}
                  className="btn btn-primary"
                />
              </>
            }
          >
            <FormGroup>
              <Field
                name="reason"
                component={TextField as any}
                as="textarea"
                placeholder={translate(
                  'Please enter reason why offering has been paused.',
                )}
                rows={7}
              />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    />
  );
};
