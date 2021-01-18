import { translate } from '@waldur/i18n';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';
import {
  validateRuntimeState,
  validateState,
} from '@waldur/resource/actions/base';

import { shutdownVirtualMachine } from '../api';

const validators = [validateState('OK'), validateRuntimeState('POWERED_ON')];

export const ShutdownAction = ({ resource }) => (
  <AsyncActionItem
    title={translate('Shutdown')}
    resource={resource}
    validators={validators}
    apiMethod={shutdownVirtualMachine}
  />
);
