import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import {
  acceptProposalReview,
  rejectProposalReview,
} from '@waldur/proposals/api';
import { ProposalReview } from '@waldur/proposals/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';

interface ReviewItemActionProps {
  row: ProposalReview;
  fetch;
}

export const ReviewItemAction = ({ row, fetch }: ReviewItemActionProps) => {
  const dispatch = useDispatch();
  const { mutate: accept, isLoading: isAcceptLoading } = useMutation(
    async () => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Start review'),
          translate(
            'Are you sure you want to start reviewing proposal {name}?',
            {
              name: <b>{row.proposal_name}</b>,
            },
            formatJsxTemplate,
          ),
        );
      } catch {
        return;
      }
      try {
        await acceptProposalReview(row.uuid);
        fetch();
        dispatch(showSuccess(translate('Review has been accepted.')));
      } catch (response) {
        dispatch(
          showErrorResponse(response, translate('Unable to accept review.')),
        );
      }
    },
  );
  const { mutate: reject, isLoading: isRejectLoading } = useMutation(
    async () => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Reject review'),
          translate(
            'Are you sure you want to reject the {name} proposal review?',
            {
              name: <b>{row.proposal_name}</b>,
            },
            formatJsxTemplate,
          ),
        );
      } catch {
        return;
      }
      try {
        await rejectProposalReview(row.uuid);
        fetch();
        dispatch(showSuccess(translate('Review has been rejected.')));
      } catch (response) {
        dispatch(
          showErrorResponse(response, translate('Unable to reject review.')),
        );
      }
    },
  );
  return row.state === 'created' ? (
    <>
      <RowActionButton
        action={accept}
        title={translate('Start review')}
        size="sm"
        variant="outline-primary"
        pending={isAcceptLoading || isRejectLoading}
      />
      <RowActionButton
        action={reject}
        title={translate('Send back')}
        size="sm"
        pending={isAcceptLoading || isRejectLoading}
      />
    </>
  ) : null;
};
