import * as React from 'react';
import Button from 'react-bootstrap/lib/Button';
import { useDispatch } from 'react-redux';

import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { showSuccess, showErrorResponse } from '@waldur/store/coreSaga';

import { disableProfile } from './api';

export const DisableProfile = ({ profile, setLoading, refreshProfile }) => {
  const dispatch = useDispatch();

  const callback = React.useCallback(async () => {
    setLoading(true);
    try {
      await disableProfile(profile.uuid);
      dispatch(
        showSuccess(translate('Your FreeIPA profile has been disabled.')),
      );
      setLoading(false);
      refreshProfile();
    } catch (response) {
      dispatch(
        showErrorResponse(
          response,
          translate('Unable to disable FreeIPA profile.'),
        ),
      );
      setLoading(false);
    }
  }, [dispatch, profile.uuid, setLoading, refreshProfile]);

  if (!profile.is_active) {
    return null;
  }
  return (
    <Tooltip
      label={translate(
        'Disable a profile in FreeIPA. Disabled profiles are not allowed for login into the Linux systems',
      )}
      id="freeipa-disable-profile"
    >
      <Button bsStyle="warning" onClick={callback}>
        <i className="fa fa-toggle-on"></i> {translate('Disable profile')}
      </Button>
    </Tooltip>
  );
};
