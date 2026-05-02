import { FC } from 'react';
import { ReviewerProfile, reviewerProfilesSyncOrcid } from 'waldur-js-client';

import { CompactSubmitButton } from '@/form/CompactSubmitButton';
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
    <CompactSubmitButton
      type="button"
      variant="outline-primary"
      onClick={() => mutate()}
      submitting={isPending}
      label={translate('Sync ORCID')}
    />
  );
};
