import { ArrowClockwiseIcon } from '@phosphor-icons/react';
import { openstackInstancesRestart } from 'waldur-js-client';
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
  if (ctx.resource.state === 'OK' && ctx.resource.runtime_state === 'SHUTOFF') {
    return translate('Please start instance first.');
  }
}

const validators = [
  validate,
  validateState('OK'),
  validateRuntimeState('ACTIVE'),
];

export const getProps = () =>
  ({
    title: translate('Restart'),
    validators,
    apiMethod: (uuid) => openstackInstancesRestart({ path: { uuid } }),
    important: true,
  }) as AsyncActionItemProps<OpenStackInstance>;

export const RestartAction: ActionItemType = ({ resource, ...rest }) => (
  <AsyncActionItem
    {...getProps()}
    resource={resource}
    {...rest}
    iconNode={<ArrowClockwiseIcon weight="bold" />}
  />
);
