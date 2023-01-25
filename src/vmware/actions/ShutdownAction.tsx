import { translate } from '@waldur/i18n';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';
import {
  validateRuntimeState,
  validateState,
} from '@waldur/resource/actions/base';
import { ActionItemType } from '@waldur/resource/actions/types';

import { shutdownVirtualMachine } from '../api';

const validators = [validateState('OK'), validateRuntimeState('POWERED_ON')];

export const ShutdownAction: ActionItemType = ({ resource, refetch }) => (
  <AsyncActionItem
    title={translate('Shutdown')}
    resource={resource}
    validators={validators}
    apiMethod={shutdownVirtualMachine}
    refetch={refetch}
  />
);
