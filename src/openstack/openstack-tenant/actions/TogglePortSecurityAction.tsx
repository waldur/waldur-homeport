import { ShieldCheckIcon } from '@phosphor-icons/react';
import {
  OpenStackPort,
  openstackPortsDisablePortSecurity,
  openstackPortsEnablePortSecurity,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { validateState } from '@/resource/actions/base';
import { ActionItemType } from '@/resource/actions/types';
import { useValidators } from '@/resource/actions/useValidators';

const validators = [validateState('OK')];

export const TogglePortSecurityAction: ActionItemType<OpenStackPort> = ({
  resource,
  refetch,
}) => {
  const { tooltip, disabled } = useValidators(validators, resource);

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => {
      const apiMethod = resource.port_security_enabled
        ? openstackPortsDisablePortSecurity
        : openstackPortsEnablePortSecurity;
      return apiMethod({ path: { uuid: resource.uuid } } as any);
    },
    successMessage: resource.port_security_enabled
      ? translate('Port security has been disabled.')
      : translate('Port security has been enabled.'),
    errorMessage: translate('Unable to apply action.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: resource.port_security_enabled
        ? translate('Are you sure you want to disable port security?')
        : translate('Are you sure you want to enable port security?'),
    },
  });

  return (
    <ActionItem
      title={
        resource.port_security_enabled
          ? translate('Disable port security')
          : translate('Enable port security')
      }
      tooltip={tooltip}
      disabled={isPending || disabled}
      action={mutate}
      important
      iconNode={<ShieldCheckIcon weight="bold" />}
    />
  );
};
