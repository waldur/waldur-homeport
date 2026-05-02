import { FC } from 'react';
import {
  ReviewerProfile,
  reviewerProfilesDisconnectOrcid,
} from 'waldur-js-client';

import { CompactSubmitButton } from '@/form/CompactSubmitButton';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface DisconnectOrcidActionProps {
  profile: ReviewerProfile;
  refetch?: () => void;
}

export const DisconnectOrcidAction: FC<DisconnectOrcidActionProps> = ({
  profile,
  refetch,
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      reviewerProfilesDisconnectOrcid({
        path: { uuid: profile.uuid },
      }),
    successMessage: translate('ORCID disconnected successfully.'),
    errorMessage: translate('Unable to disconnect ORCID.'),
    refetch,
    confirmation: {
      title: translate('Disconnect ORCID'),
      body: translate('Are you sure you want to disconnect ORCID?'),
    },
  });

  return (
    <CompactSubmitButton
      type="button"
      variant="danger"
      onClick={() => mutate()}
      submitting={isPending}
      label={translate('Disconnect ORCID')}
    />
  );
};
