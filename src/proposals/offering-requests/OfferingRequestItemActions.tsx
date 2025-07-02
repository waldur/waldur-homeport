import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import {
  proposalRequestedOfferingsAccept,
  proposalRequestedOfferingsCancel,
  ProviderRequestedOffering,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';

interface OfferingRequestItemActionsProps {
  row: ProviderRequestedOffering;
  fetch;
}

export const OfferingRequestItemActions = ({
  row,
  fetch,
}: OfferingRequestItemActionsProps) => {
  const dispatch = useDispatch();
  const { mutate: accept, isPending: isAcceptLoading } = useMutation({
    mutationFn: async () => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Accepting offering request'),
          translate(
            'Are you sure you want to accept the {name} offering request?',
            {
              name: <b>{row.offering_name}</b>,
            },
            formatJsxTemplate,
          ),
        );
      } catch {
        return;
      }
      try {
        await proposalRequestedOfferingsAccept({ path: { uuid: row.uuid } });
        fetch();
        dispatch(showSuccess(translate('Offering request has been accepted.')));
      } catch (response) {
        dispatch(
          showErrorResponse(
            response,
            translate('Unable to accept offering request.'),
          ),
        );
      }
    },
  });
  const { mutate: reject, isPending: isRejectLoading } = useMutation({
    mutationFn: async () => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Rejecting offering request'),
          translate(
            'Are you sure you want to reject the {name} offering request?',
            {
              name: <b>{row.offering_name}</b>,
            },
            formatJsxTemplate,
          ),
        );
      } catch {
        return;
      }
      try {
        await proposalRequestedOfferingsCancel({ path: { uuid: row.uuid } });
        fetch();
        dispatch(showSuccess(translate('Offering request has been rejected.')));
      } catch (response) {
        dispatch(
          showErrorResponse(
            response,
            translate('Unable to reject offering request.'),
          ),
        );
      }
    },
  });
  return row.state === 'requested' ? (
    <>
      <RowActionButton
        action={accept}
        title={translate('Accept')}
        variant="light-primary"
        pending={isAcceptLoading || isRejectLoading}
        size="sm"
      />

      <RowActionButton
        action={reject}
        title={translate('Reject')}
        variant="light-danger"
        pending={isAcceptLoading || isRejectLoading}
        size="sm"
      />
    </>
  ) : null;
};
