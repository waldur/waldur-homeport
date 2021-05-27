import { stopVirtualMachine } from '@waldur/azure/api';
import { translate } from '@waldur/i18n';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';
import {
  validateState,
  validateRuntimeState,
} from '@waldur/resource/actions/base';

const validators = [validateState('OK'), validateRuntimeState('running')];

export const StopAction = ({ resource }) => (
  <AsyncActionItem
    title={translate('Stop')}
    resource={resource}
    validators={validators}
    apiMethod={stopVirtualMachine}
  />
);
