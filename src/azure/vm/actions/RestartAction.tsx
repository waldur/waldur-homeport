import { restartVirtualMachine } from '@waldur/azure/api';
import { translate } from '@waldur/i18n';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';
import {
  validateState,
  validateRuntimeState,
} from '@waldur/resource/actions/base';

const validators = [validateState('OK'), validateRuntimeState('running')];

export const RestartAction = ({ resource }) => (
  <AsyncActionItem
    title={translate('Restart')}
    resource={resource}
    validators={validators}
    apiMethod={restartVirtualMachine}
  />
);
