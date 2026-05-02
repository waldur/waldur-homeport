import { FC } from 'react';
import {
  ReviewerProfile,
  reviewerProfilesConnectOrcidRetrieve,
} from 'waldur-js-client';

import { CompactSubmitButton } from '@/form/CompactSubmitButton';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface ConnectOrcidActionProps {
  profile: ReviewerProfile;
}

export const ConnectOrcidAction: FC<ConnectOrcidActionProps> = ({
  profile,
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: async () => {
      const result = await reviewerProfilesConnectOrcidRetrieve({
        path: { uuid: profile.uuid },
      });
      const authUrl = result.data.authorization_url;
      if (authUrl) {
        window.location.href = authUrl;
      }
    },
    errorMessage: translate('Unable to connect ORCID.'),
  });

  return (
    <CompactSubmitButton
      type="button"
      variant="success"
      onClick={() => mutate()}
      submitting={isPending}
      label={translate('Connect ORCID')}
    />
  );
};
