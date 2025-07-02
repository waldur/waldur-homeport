import { ShieldCheckIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import {
  OpenStackPort,
  openstackPortsDisablePortSecurity,
  openstackPortsEnablePortSecurity,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { validateState } from '@waldur/resource/actions/base';
import { ActionItemType } from '@waldur/resource/actions/types';
import { useValidators } from '@waldur/resource/actions/useValidators';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

const validators = [validateState('OK')];

export const TogglePortSecurityAction: ActionItemType<OpenStackPort> = ({
  resource,
  refetch,
}) => {
  const dispatch = useDispatch();
  const { tooltip, disabled } = useValidators(validators, resource);

  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        resource.port_security_enabled
          ? translate('Are you sure you want to disable port security?')
          : translate('Are you sure you want to enable port security?'),
      );
    } catch {
      return;
    }
    try {
      const apiMethod = resource.port_security_enabled
        ? openstackPortsDisablePortSecurity
        : openstackPortsEnablePortSecurity;

      await apiMethod({ path: { uuid: resource.uuid } } as any);
      dispatch(
        showSuccess(
          resource.port_security_enabled
            ? translate('Port security has been disabled.')
            : translate('Port security has been enabled.'),
        ),
      );
      if (refetch) {
        await refetch();
      }
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to apply action.')));
    }
  };

  return (
    <ActionItem
      title={
        resource.port_security_enabled
          ? translate('Disable port security')
          : translate('Enable port security')
      }
      tooltip={tooltip}
      disabled={disabled}
      action={callback}
      important
      iconNode={<ShieldCheckIcon weight="bold" />}
    />
  );
};
