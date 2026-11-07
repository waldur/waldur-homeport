import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  proposalRequestedOfferingsCancel,
  ProviderRequestedOffering,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { OFFERING_REQUEST_ANSWERED_QUERIES } from './queries';

interface RejectOfferingRequestDialogProps {
  resolve: { row: ProviderRequestedOffering; refetch: () => void };
}

interface FormValues {
  reason: string;
}

/** Declining a call's request, saying why for the call's managers. */
export const RejectOfferingRequestDialog: FC<
  RejectOfferingRequestDialogProps
> = ({ resolve: { row, refetch } }) => {
  const { mutate, isPending } = useManagedMutation<any, any, FormValues>({
    mutationFn: ({ reason }) =>
      proposalRequestedOfferingsCancel({
        path: { uuid: row.uuid },
        body: { reason: reason.trim() },
      }),
    refetch,
    invalidateQueries: OFFERING_REQUEST_ANSWERED_QUERIES,
    successMessage: translate('Offering request has been rejected.'),
    errorMessage: translate('Unable to reject offering request.'),
  });
  return (
    <Form<FormValues>
      onSubmit={(values) => mutate(values)}
      render={({ handleSubmit, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Reject {offering} in {call}', {
              offering: row.offering_name,
              call: row.call_name,
            })}
            subtitle={translate(
              'Proposals in the call can no longer request the offering.',
            )}
            footer={
              <>
                <CloseDialogButton disabled={isPending} />
                <SubmitButton
                  submitting={isPending}
                  disabled={invalid}
                  label={translate('Reject')}
                  variant="danger"
                />
              </>
            }
          >
            <TextGroup
              name="reason"
              label={translate('Reason')}
              description={translate('Shown to the call’s managers.')}
              rows={3}
              required
              validate={(value: string) =>
                required(value?.trim() ? value : undefined)
              }
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
