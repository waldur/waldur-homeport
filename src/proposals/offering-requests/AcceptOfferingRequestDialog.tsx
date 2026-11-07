import { FC } from 'react';
import {
  proposalRequestedOfferingsAccept,
  ProviderRequestedOffering,
} from 'waldur-js-client';

import { AlertItem, BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { needsOfferingManagers } from '@/proposals/provider-calls/providerCalls';

import { OfferingRequestCommitments } from './OfferingRequestCommitments';
import { OFFERING_REQUEST_ANSWERED_QUERIES } from './queries';

interface AcceptOfferingRequestDialogProps {
  resolve: { row: ProviderRequestedOffering; refetch: () => void };
}

/** Accepting a call's request, with what accepting commits the provider to. */
export const AcceptOfferingRequestDialog: FC<
  AcceptOfferingRequestDialogProps
> = ({ resolve: { row, refetch } }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalRequestedOfferingsAccept({ path: { uuid: row.uuid } }),
    refetch,
    invalidateQueries: OFFERING_REQUEST_ANSWERED_QUERIES,
    successMessage: translate('Offering request has been accepted.'),
    errorMessage: translate('Unable to accept offering request.'),
  });
  return (
    <ModalDialog
      title={translate('Accept {offering} in {call}', {
        offering: row.offering_name,
        call: row.call_name,
      })}
      subtitle={translate(
        'Proposals in the call can then request the offering on these terms.',
      )}
      footer={
        <>
          <CloseDialogButton disabled={isPending} />
          <BaseButton
            label={translate('Accept')}
            variant="primary"
            onClick={() => mutate()}
            disabled={isPending}
            disabledReason={translate('Accepting…')}
          />
        </>
      }
    >
      <OfferingRequestCommitments row={row} />
      {needsOfferingManagers({ ...row, state: 'accepted' }) ? (
        <AlertItem
          type="floating"
          variant="warning"
          className="mt-3"
          title={translate('The call needs this offering’s managers')}
          body={translate(
            'Its workflow hands {count} steps to the offering’s managers, and the offering has none. Accepting is fine, but add offering managers on the offering’s Team tab before proposals reach those steps: nobody else can do them.',
            { count: row.team_steps_count },
          )}
        />
      ) : null}
    </ModalDialog>
  );
};
