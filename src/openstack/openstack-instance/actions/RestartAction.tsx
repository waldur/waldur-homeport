import { translate } from '@waldur/i18n';
import { restartInstance } from '@waldur/openstack/api';
import { OpenStackInstance } from '@waldur/openstack/openstack-instance/types';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';
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

export const RestartAction: ActionItemType = ({ resource, ...rest }) => (
  <AsyncActionItem
    title={translate('Restart')}
    iconClass="fa-refresh"
    resource={resource}
    validators={validators}
    apiMethod={restartInstance}
    {...rest}
  />
);
