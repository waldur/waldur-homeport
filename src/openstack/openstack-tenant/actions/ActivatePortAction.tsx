import { PowerIcon } from '@phosphor-icons/react';
import {
  OpenStackPort,
  openstackPortsDisablePort,
  openstackPortsEnablePort,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { validateState } from '@/resource/actions/base';
import { ActionItemType } from '@/resource/actions/types';
import { useValidators } from '@/resource/actions/useValidators';

const validators = [validateState('OK')];

export const ActivatePortAction: ActionItemType<OpenStackPort> = ({
  resource,
  refetch,
}) => {
  const { tooltip, disabled } = useValidators(validators, resource);

  const { mutate, isPending = false } = useManagedMutation<any, any, void>({
    mutationFn: () => {
      const apiMethod = resource.admin_state_up
        ? openstackPortsDisablePort
        : openstackPortsEnablePort;
      return apiMethod({ path: { uuid: resource.uuid } } as any);
    },
    successMessage: resource.admin_state_up
      ? translate('Port has been disabled.')
      : translate('Port has been enabled.'),
    errorMessage: translate('Unable to apply action.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: resource.admin_state_up
        ? translate('Are you sure you want to disable this port?')
        : translate('Are you sure you want to enable this port?'),
    },
  });

  return (
    <ActionItem
      title={
        resource.admin_state_up
          ? translate('Disable port')
          : translate('Enable port')
      }
      tooltip={tooltip}
      disabled={disabled || isPending}
      action={mutate}
      iconNode={<PowerIcon weight="bold" />}
    />
  );
};
