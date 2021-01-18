import { translate } from '@waldur/i18n';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';
import {
  validateRuntimeState,
  validateState,
} from '@waldur/resource/actions/base';

import { rebootVirtualMachine } from '../api';

const validators = [validateState('OK'), validateRuntimeState('POWERED_ON')];

export const RebootAction = ({ resource }) => (
  <AsyncActionItem
    title={translate('Reboot')}
    resource={resource}
    validators={validators}
    apiMethod={rebootVirtualMachine}
  />
);
