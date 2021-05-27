import { startVirtualMachine } from '@waldur/azure/api';
import { translate } from '@waldur/i18n';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';
import {
  validateState,
  validateRuntimeState,
} from '@waldur/resource/actions/base';

const validators = [validateState('OK'), validateRuntimeState('stopped')];

export const StartAction = ({ resource }) => (
  <AsyncActionItem
    title={translate('Start')}
    resource={resource}
    validators={validators}
    apiMethod={startVirtualMachine}
  />
);
