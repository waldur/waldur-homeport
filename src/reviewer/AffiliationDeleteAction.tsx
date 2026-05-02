import { FunctionComponent } from 'react';
import { nestedReviewerProfileAffiliationsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const AffiliationDeleteAction: FunctionComponent<{
  row?;
  refetch?;
  profile;
}> = ({ row, refetch, profile }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      nestedReviewerProfileAffiliationsDestroy({
        path: { reviewer_profile_uuid: profile.uuid, uuid: row.uuid },
      }),
    successMessage: translate('Affiliation has been deleted.'),
    errorMessage: translate('Unable to delete affiliation.'),
    refetch,
    confirmation: {
      title: translate('Delete confirmation'),
      body: translate('Are you sure you want to delete this affiliation?'),
      options: { forDeletion: true },
    },
  });

  return (
    <ActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending}
    />
  );
};
