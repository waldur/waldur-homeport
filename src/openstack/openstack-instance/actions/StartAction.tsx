import { translate } from '@waldur/i18n';
import { startInstance } from '@waldur/openstack/api';
import { OpenStackInstance } from '@waldur/openstack/openstack-instance/types';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';
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

export const getProps = () => ({
  title: translate('Start'),
  iconClass: 'fa-play',
  validators,
  apiMethod: startInstance,
});

export const StartAction: ActionItemType = ({ resource, ...rest }) => (
  <AsyncActionItem {...getProps()} resource={resource} {...rest} />
);
