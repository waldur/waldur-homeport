import { useCallback, FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { enableProfile } from './api';

export const EnableProfile: FunctionComponent<{
  profile;
  setLoading;
  refreshProfile;
}> = ({ profile, setLoading, refreshProfile }) => {
  const dispatch = useDispatch();

  const callback = useCallback(async () => {
    setLoading(true);
    try {
      await enableProfile(profile.uuid);
      dispatch(
        showSuccess(translate('Your FreeIPA profile has been enabled.')),
      );
      setLoading(false);
      refreshProfile();
    } catch (response) {
      dispatch(
        showErrorResponse(
          response,
          translate('Unable to enable FreeIPA profile.'),
        ),
      );
      setLoading(false);
    }
  }, [dispatch, profile.uuid, setLoading, refreshProfile]);

  if (profile.is_active) {
    return null;
  }

  return (
    <Tooltip
      label={translate(
        'Enable a profile in FreeIPA. Only enabled profiles are allowed for login into the Linux systems',
      )}
      id="freeipa-enable-profile"
    >
      <Button bsStyle="success" onClick={callback}>
        <i className="fa fa-toggle-off"></i> {translate('Enable profile')}
      </Button>
    </Tooltip>
  );
};
