import { proposalReviewsReject } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { ProposalReview } from '../types';

export const useReviewActions = (review: ProposalReview, refetch = null) => {
  const rejectMutation = useManagedMutation<any, any, void>({
    mutationFn: () => proposalReviewsReject({ path: { uuid: review.uuid } }),
    successMessage: translate('Review has been rejected.'),
    errorMessage: translate('Unable to reject review.'),
    refetch,
    confirmation: {
      title: translate('Reject review'),
      body: translate(
        'Are you sure you want to reject the {name} proposal review?',
        {
          name: <b>{review.proposal_name}</b>,
        },
        formatJsxTemplate,
      ),
    },
  });

  return {
    reject: () => rejectMutation.mutateAsync(),
    isRejecting: rejectMutation.isPending,
  };
};
