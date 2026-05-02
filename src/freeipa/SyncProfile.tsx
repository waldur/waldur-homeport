import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FunctionComponent, useEffect } from 'react';
import { freeipaProfilesUpdateSshKeys } from 'waldur-js-client';

import { Tip } from '@/core/Tooltip';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';

export const SyncProfile: FunctionComponent<{
  profile;
  setLoading;
  refreshProfile;
}> = ({ profile, setLoading, refreshProfile }) => {
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

  useEffect(() => {
    setLoading(isPending);
  }, [isPending, setLoading]);

  return (
    <Tip
      label={translate('Add Waldur user SSH keys to the FreeIPA profile')}
      id="freeipa-sync-profile"
    >
      <SubmitButton
        submitting={isPending}
        type="button"
        variant="primary"
        className="ms-2"
        onClick={() => syncProfile()}
        label={translate('Sync profile')}
        iconNode={<ArrowsClockwiseIcon weight="bold" />}
        iconOnLeft
      />
    </Tip>
  );
};
