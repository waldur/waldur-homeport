import { FunctionComponent } from 'react';
import { Form } from 'react-final-form';
import { marketplaceProviderOfferingsPause } from 'waldur-js-client';

import { SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { SelectedOfferingsSummary } from './SelectedOfferingsSummary';
import {
  BulkOfferingsDialogResolve,
  useOfferingBatch,
} from './useOfferingBatch';

export const BulkPauseOfferingsDialog: FunctionComponent<{
  resolve: BulkOfferingsDialogResolve;
}> = ({ resolve: { offerings, skippedNote, table, refetch } }) => {
  const batch = useOfferingBatch({ table, refetch, closeModal: true });

  const onSubmit = (values: { reason?: string }) =>
    batch.submit({
      offerings,
      run: (offering) =>
        marketplaceProviderOfferingsPause({
          path: { uuid: offering.uuid },
          body: { paused_reason: values.reason },
        }),
      successMessage: (count) =>
        translate('{count} offering(s) have been paused.', { count }),
      failureMessage: (count) =>
        translate('Unable to pause {count} offering(s).', { count }),
    });

  return (
    <Form
      onSubmit={onSubmit}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Pause offerings')}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  submitting={submitting}
                  label={translate('Pause')}
                  variant="primary"
                />
              </>
            }
          >
            <div className="flex flex-col gap-4">
              <SelectedOfferingsSummary
                targets={offerings}
                skippedNote={skippedNote}
              />
              <TextGroup
                name="reason"
                label={translate('Reason')}
                description={translate(
                  'Saved on every paused offering and shown in the marketplace.',
                )}
                placeholder={translate(
                  'Please enter reason why offering has been paused.',
                )}
                rows={5}
                spaceless
              />
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
