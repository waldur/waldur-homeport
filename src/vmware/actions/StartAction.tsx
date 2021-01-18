import { translate } from '@waldur/i18n';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';
import {
  validateRuntimeState,
  validateState,
} from '@waldur/resource/actions/base';

import { startVirtualMachine } from '../api';

const validators = [
  validateState('OK'),
  validateRuntimeState('POWERED_OFF', 'SUSPENDED'),
];

export const StartAction = ({ resource }) => (
  <AsyncActionItem
    title={translate('Start')}
    resource={resource}
    validators={validators}
    apiMethod={startVirtualMachine}
  />
);
