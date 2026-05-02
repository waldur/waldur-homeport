import { FunctionComponent } from 'react';
import { nestedReviewerProfilePublicationsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const PublicationDeleteAction: FunctionComponent<{
  row?;
  refetch?;
  profile;
}> = ({ row, refetch, profile }) => {
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      nestedReviewerProfilePublicationsDestroy({
        path: { reviewer_profile_uuid: profile.uuid, uuid: row.uuid },
      }),
    successMessage: translate('Publication has been deleted.'),
    errorMessage: translate('Unable to delete publication.'),
    refetch,
    confirmation: {
      title: translate('Delete confirmation'),
      body: translate('Are you sure you want to delete this publication?'),
      options: { forDeletion: true },
    },
  });

  return (
    <ActionItem
      title={translate('Delete')}
      action={() => deleteMutation.mutate()}
      disabled={deleteMutation.isPending}
    />
  );
};
