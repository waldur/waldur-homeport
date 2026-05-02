import {
  nestedReviewerProfileExpertiseDestroy,
  ReviewerExpertise,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { RemovalActionButton } from '@/table/RemovalActionButton';

interface OwnProps {
  rows: ReviewerExpertise[];
  refetch(): void;
  profile: { uuid: string };
}

export const ExpertiseBulkRemoveButton = ({
  rows,
  refetch,
  profile,
}: OwnProps) => {
  const { mutate, isPending } = useBatchMutation({
    rows,
    refetch,
    mutationFn: (row) =>
      nestedReviewerProfileExpertiseDestroy({
        path: {
          reviewer_profile_uuid: profile.uuid,
          uuid: row.uuid,
        },
      }),
    successMessage: translate(
      'Selected expertise keywords have been successfully removed.',
    ),
    renderPartialSuccessMessage: (n) =>
      translate('{n} expertise keywords have been removed.', { n }),
    errorMessage: translate('Some expertise keywords could not be removed.'),
    confirmation: {
      title: translate('Remove selected expertise'),
      body: (
        <div>
          <p>
            {translate('You are about to remove these expertise keywords:')}
          </p>
          <ul>
            {rows.map((row) => (
              <li key={row.uuid}>{row.expertise_keyword}</li>
            ))}
          </ul>
        </div>
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionButton
      title={translate('Remove')}
      action={mutate}
      pending={isPending}
      disabled={isPending}
      disabledReason={isPending ? translate('Removal in progress') : undefined}
    />
  );
};
