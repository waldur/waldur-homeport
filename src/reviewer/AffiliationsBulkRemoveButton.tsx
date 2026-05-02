import {
  nestedReviewerProfileAffiliationsDestroy,
  ReviewerAffiliation,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { RemovalActionButton } from '@/table/RemovalActionButton';

interface OwnProps {
  rows: ReviewerAffiliation[];
  refetch(): void;
  profile: { uuid: string };
}

export const AffiliationsBulkRemoveButton = ({
  rows,
  refetch,
  profile,
}: OwnProps) => {
  const { mutate, isPending } = useBatchMutation({
    rows,
    refetch,
    mutationFn: (row) =>
      nestedReviewerProfileAffiliationsDestroy({
        path: {
          reviewer_profile_uuid: profile.uuid,
          uuid: row.uuid,
        },
      }),
    successMessage: translate(
      'Selected affiliations have been successfully removed.',
    ),
    renderPartialSuccessMessage: (n) =>
      translate('{n} affiliations have been removed.', { n }),
    errorMessage: translate('Some affiliations could not be removed.'),
    confirmation: {
      title: translate('Remove selected affiliations'),
      body: (
        <div>
          <p>{translate('You are about to remove these affiliations:')}</p>
          <ul>
            {rows.map((row) => (
              <li key={row.uuid}>
                {row.organization_name_display}
                {row.position_title && ` - ${row.position_title}`}
              </li>
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
