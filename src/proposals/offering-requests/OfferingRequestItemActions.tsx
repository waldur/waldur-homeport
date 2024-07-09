import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import {
  acceptCallOfferingRequest,
  rejectCallOfferingRequest,
} from '@waldur/proposals/api';
import { CallOffering } from '@waldur/proposals/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';

interface OfferingRequestItemActionsProps {
  row: CallOffering;
  fetch;
}

export const OfferingRequestItemActions = ({
  row,
  fetch,
}: OfferingRequestItemActionsProps) => {
  const dispatch = useDispatch();
  const { mutate: accept, isLoading: isAcceptLoading } = useMutation(
    async () => {
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
        await acceptCallOfferingRequest(row.uuid);
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
  );
  const { mutate: reject, isLoading: isRejectLoading } = useMutation(
    async () => {
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
        await rejectCallOfferingRequest(row.uuid);
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
  );
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
