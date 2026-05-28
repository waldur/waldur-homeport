import { proposalReviewsDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const ReviewDeleteAction = (props) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalReviewsDestroy({ path: { uuid: props.row.uuid } }),
    refetch: props.refetch,

    confirmation: {
      title: translate('Confirmation'),

      body: translate(
        'Are you sure you want to delete the review for proposal {proposal_name}?',
        { proposal_name: <strong>{props.row.proposal_name}</strong> },
        formatJsxTemplate,
      ),

      options: {
        forDeletion: true,
      },
    },

    successMessage: translate('Review removed successfully.'),
    errorMessage: translate('Unable to remove review.'),
  });

  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={mutate}
      disabled={isPending}
    />
  );
};
