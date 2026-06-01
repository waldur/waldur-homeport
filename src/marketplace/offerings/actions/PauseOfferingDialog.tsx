import { FunctionComponent } from 'react';
import { Form } from 'react-final-form';
import { marketplaceProviderOfferingsPause } from 'waldur-js-client';

import { SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

export const PauseOfferingDialog: FunctionComponent<{
  resolve: { offering; refreshOffering };
}> = ({ resolve: { offering, refreshOffering } }) => {
  const pauseMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      marketplaceProviderOfferingsPause({
        path: { uuid: offering.uuid },
        body: { paused_reason: formData.reason },
      }),
    successMessage: translate('Offering has been paused.'),
    errorMessage: translate('Unable to pause offering.'),
    refetch: refreshOffering,
  });

  return (
    <Form
      onSubmit={(values) => pauseMutation.mutateAsync(values)}
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
            <TextGroup
              name="reason"
              as="textarea"
              placeholder={translate(
                'Please enter reason why offering has been paused.',
              )}
              rows={7}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
