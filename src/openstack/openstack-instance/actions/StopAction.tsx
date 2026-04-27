import { StopIcon } from '@phosphor-icons/react';
import { openstackInstancesStop } from 'waldur-js-client';
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
    return translate('Instance is already stopped.');
  }
}

const validators = [
  validate,
  validateState('OK'),
  validateRuntimeState('ACTIVE'),
  validateOpenStackInstancePowerPermission,
];

export const getProps = () =>
  ({
    title: translate('Stop'),
    validators,
    apiMethod: (uuid) => openstackInstancesStop({ path: { uuid } }),
    important: true,
  }) as AsyncActionItemProps<OpenStackInstance>;

export const StopAction: ActionItemType = ({ resource, ...rest }) => (
  <AsyncActionItem
    {...getProps()}
    resource={resource}
    {...rest}
    iconNode={<StopIcon weight="bold" />}
  />
);
