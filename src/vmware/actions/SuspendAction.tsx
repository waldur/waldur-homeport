import { translate } from '@waldur/i18n';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';
import {
  validateRuntimeState,
  validateState,
} from '@waldur/resource/actions/base';

import { suspendVirtualMachine } from '../api';

const validators = [validateState('OK'), validateRuntimeState('POWERED_ON')];

export const SuspendAction = ({ resource }) => (
  <AsyncActionItem
    title={translate('Suspend')}
    resource={resource}
    validators={validators}
    apiMethod={suspendVirtualMachine}
  />
);
