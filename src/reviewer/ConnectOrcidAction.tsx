import { FC } from 'react';
import {
  ReviewerProfile,
  reviewerProfilesConnectOrcidRetrieve,
} from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

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
    <BaseButton
      size="sm"
      variant="success"
      onClick={() => mutate()}
      pending={isPending}
      label={translate('Connect ORCID')}
    />
  );
};
