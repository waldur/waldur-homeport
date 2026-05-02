import { FunctionComponent } from 'react';
import { nestedReviewerProfileExpertiseDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const ExpertiseDeleteAction: FunctionComponent<{
  row?;
  refetch?;
  profile;
}> = ({ row, refetch, profile }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      nestedReviewerProfileExpertiseDestroy({
        path: { reviewer_profile_uuid: profile.uuid, uuid: row.uuid },
      }),
    successMessage: translate('Expertise has been deleted.'),
    errorMessage: translate('Unable to delete expertise.'),
    refetch,
    confirmation: {
      title: translate('Delete confirmation'),
      body: translate('Are you sure you want to delete this expertise?'),
    },
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending}
    />
  );
};
