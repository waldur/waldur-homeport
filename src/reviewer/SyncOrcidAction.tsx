import { FC } from 'react';
import { ReviewerProfile, reviewerProfilesSyncOrcid } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface SyncOrcidActionProps {
  profile: ReviewerProfile;
  refetch?: () => void;
}

export const SyncOrcidAction: FC<SyncOrcidActionProps> = ({
  profile,
  refetch,
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      reviewerProfilesSyncOrcid({
        path: { uuid: profile.uuid },
      }),
    successMessage: translate('ORCID data synchronized successfully.'),
    errorMessage: translate('Unable to sync ORCID data.'),
    refetch,
    invalidateQueries: [
      { queryKey: ['reviewerAffiliationsList'] },
      { queryKey: ['reviewerExpertiseList'] },
      { queryKey: ['reviewerPublicationsList'] },
      { queryKey: ['reviewerAffiliationsCount'] },
      { queryKey: ['reviewerExpertiseCount'] },
      { queryKey: ['reviewerPublicationsCount'] },
    ],
  });

  return (
    <BaseButton
      size="sm"
      variant="secondary"
      onClick={() => mutate()}
      pending={isPending}
      label={translate('Sync ORCID')}
    />
  );
};
