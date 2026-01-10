import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { proposalReviewsReject } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { ProposalReview } from '../types';

export const useReviewActions = (review: ProposalReview, refetch = null) => {
  const dispatch = useDispatch();

  const { mutate: reject, isPending: isRejecting } = useMutation({
    mutationFn: async () => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Reject review'),
          translate(
            'Are you sure you want to reject the {name} proposal review?',
            {
              name: <b>{review.proposal_name}</b>,
            },
            formatJsxTemplate,
          ),
        );
      } catch {
        return;
      }
      try {
        await proposalReviewsReject({ path: { uuid: review.uuid } });
        if (refetch) refetch();
        dispatch(showSuccess(translate('Review has been rejected.')));
      } catch (response) {
        dispatch(
          showErrorResponse(response, translate('Unable to reject review.')),
        );
      }
    },
  });

  return {
    reject,
    isRejecting,
  };
};
