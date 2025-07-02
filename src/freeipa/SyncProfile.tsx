import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useCallback, FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { freeipaProfilesUpdateSshKeys } from 'waldur-js-client';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

export const SyncProfile: FunctionComponent<{
  profile;
  setLoading;
  refreshProfile;
}> = ({ profile, setLoading, refreshProfile }) => {
  const dispatch = useDispatch();
  const callback = useCallback(async () => {
    setLoading(true);
    try {
      const result = await freeipaProfilesUpdateSshKeys({
        path: { uuid: profile.uuid },
      });
      if (result.response.status === 204) {
        dispatch(
          showSuccess(
            translate('Your FreeIPA has been removed in FreeIPA server.'),
          ),
        );
        return refreshProfile();
      } else {
        dispatch(
          showSuccess(translate('Your FreeIPA has been synced successfully.')),
        );
      }
      setLoading(false);
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to sync FreeIPA profile.')),
      );
      setLoading(false);
    }
  }, [dispatch, setLoading, refreshProfile, profile.uuid]);

  return (
    <Tip
      label={translate('Add Waldur user SSH keys to the FreeIPA profile')}
      id="freeipa-sync-profile"
    >
      <Button variant="primary" className="ms-2" onClick={callback}>
        <span className="svg-icon svg-icon-2">
          <ArrowsClockwiseIcon />
        </span>{' '}
        {translate('Sync profile')}
      </Button>
    </Tip>
  );
};
