import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { freeipaProfilesUpdateSshKeys } from 'waldur-js-client';

import { Tooltip, BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';

export const SyncProfile: FunctionComponent<{
  profile;
  refreshProfile;
}> = ({ profile, refreshProfile }) => {
  const { showSuccess } = useNotify();

  const { mutate: syncProfile, isPending } = useManagedMutation<any, any, void>(
    {
      mutationFn: () =>
        freeipaProfilesUpdateSshKeys({
          path: { uuid: profile.uuid },
        }),
      onSuccess: (result) => {
        if (result.response.status === 204) {
          showSuccess(
            translate('Your FreeIPA has been removed in FreeIPA server.'),
          );
          refreshProfile();
        } else {
          showSuccess(translate('Your FreeIPA has been synced successfully.'));
        }
      },
      errorMessage: translate('Unable to sync FreeIPA profile.'),
    },
  );

  return (
    <Tooltip
      label={translate('Add Waldur user SSH keys to the FreeIPA profile')}
    >
      <BaseButton
        pending={isPending}
        variant="primary"
        onClick={() => syncProfile()}
        label={translate('Sync profile')}
        iconNode={<ArrowsClockwiseIcon weight="bold" />}
        className="ms-2"
        size="lg"
      />
    </Tooltip>
  );
};
