import { PowerIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  OpenStackPort,
  openstackPortsDisablePort,
  openstackPortsEnablePort,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { validateState } from '@waldur/resource/actions/base';
import { ActionItemType } from '@waldur/resource/actions/types';
import { useValidators } from '@waldur/resource/actions/useValidators';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

const validators = [validateState('OK')];

export const ActivatePortAction: ActionItemType<OpenStackPort> = ({
  resource,
  refetch,
}) => {
  const dispatch = useDispatch();
  const { tooltip, disabled } = useValidators(validators, resource);

  const callback = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        resource.admin_state_up
          ? translate('Are you sure you want to disable this port?')
          : translate('Are you sure you want to enable this port?'),
      );
    } catch {
      return;
    }
    try {
      const apiMethod = resource.admin_state_up
        ? openstackPortsDisablePort
        : openstackPortsEnablePort;

      await apiMethod({ path: { uuid: resource.uuid } } as any);
      dispatch(
        showSuccess(
          resource.admin_state_up
            ? translate('Port has been disabled.')
            : translate('Port has been enabled.'),
        ),
      );
      if (refetch) {
        await refetch();
      }
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to apply action.')));
    }
  }, [resource, refetch, dispatch]);

  return (
    <ActionItem
      title={
        resource.admin_state_up
          ? translate('Disable port')
          : translate('Enable port')
      }
      tooltip={tooltip}
      disabled={disabled}
      action={callback}
      iconNode={<PowerIcon weight="bold" />}
    />
  );
};
