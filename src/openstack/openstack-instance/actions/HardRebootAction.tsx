import { PowerIcon } from '@phosphor-icons/react';
import { openstackInstancesHardReboot } from 'waldur-js-client';
import { OpenStackInstance } from 'waldur-js-client';

import { translate } from '@/i18n';
import { validateOpenStackInstancePowerPermission } from '@/openstack/utils';
import {
  AsyncActionItem,
  AsyncActionItemProps,
} from '@/resource/actions/AsyncActionItem';
import { validateState, validateRuntimeState } from '@/resource/actions/base';
import { ActionContext, ActionItemType } from '@/resource/actions/types';

function validate(ctx: ActionContext<OpenStackInstance>): string {
  if (ctx.resource.state === 'OK' && ctx.resource.runtime_state === 'SHUTOFF') {
    return translate('Instance is stopped. Start it instead.');
  }
}

const validators = [
  validate,
  validateState('OK', 'ERRED'),
  validateRuntimeState('ACTIVE', 'ERROR', 'PAUSED', 'SUSPENDED', 'REBOOT'),
  validateOpenStackInstancePowerPermission,
];

const getProps = () =>
  ({
    title: translate('Hard reboot'),
    validators,
    apiMethod: (uuid) => openstackInstancesHardReboot({ path: { uuid } }),
  }) as AsyncActionItemProps<OpenStackInstance>;

export const HardRebootAction: ActionItemType = ({ resource, ...rest }) => (
  <AsyncActionItem
    {...getProps()}
    resource={resource}
    {...rest}
    iconNode={<PowerIcon weight="bold" />}
  />
);
