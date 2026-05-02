import {
  nestedReviewerProfilePublicationsDestroy,
  ReviewerPublication,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { RemovalActionButton } from '@/table/RemovalActionButton';

interface OwnProps {
  rows: ReviewerPublication[];
  refetch(): void;
  profile: { uuid: string };
}

export const PublicationsBulkRemoveButton = ({
  rows,
  refetch,
  profile,
}: OwnProps) => {
  const { mutate, isPending } = useBatchMutation({
    rows,
    refetch,
    mutationFn: (row) =>
      nestedReviewerProfilePublicationsDestroy({
        path: {
          reviewer_profile_uuid: profile.uuid,
          uuid: row.uuid,
        },
      }),
    successMessage: translate(
      'Selected publications have been successfully removed.',
    ),
    renderPartialSuccessMessage: (n) =>
      translate('{n} publications have been removed.', { n }),
    errorMessage: translate('Some publications could not be removed.'),
    confirmation: {
      title: translate('Remove selected publications'),
      body: (
        <div>
          <p>{translate('You are about to remove these publications:')}</p>
          <ul>
            {rows.map((row) => (
              <li key={row.uuid}>{row.title}</li>
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
