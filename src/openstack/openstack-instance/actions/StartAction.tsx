import { PlayIcon } from '@phosphor-icons/react';
import { openstackInstancesStart } from 'waldur-js-client';
import { OpenStackInstance } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import {
  AsyncActionItem,
  AsyncActionItemProps,
} from '@waldur/resource/actions/AsyncActionItem';
import {
  validateState,
  validateRuntimeState,
} from '@waldur/resource/actions/base';
import { ActionContext, ActionItemType } from '@waldur/resource/actions/types';

function validate(ctx: ActionContext<OpenStackInstance>): string {
  if (ctx.resource.state === 'OK' && ctx.resource.runtime_state === 'ACTIVE') {
    return translate('Instance is already active.');
  }
}

const validators = [
  validate,
  validateState('OK'),
  validateRuntimeState('SHUTOFF'),
];

export const getProps = () =>
  ({
    title: translate('Start'),
    validators,
    apiMethod: (uuid) => openstackInstancesStart({ path: { uuid } }),
    important: true,
  }) as AsyncActionItemProps<OpenStackInstance>;

export const StartAction: ActionItemType = ({ resource, ...rest }) => (
  <AsyncActionItem
    {...getProps()}
    resource={resource}
    {...rest}
    iconNode={<PlayIcon weight="bold" />}
  />
);
