import { translate } from '@waldur/i18n';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';
import {
  validateRuntimeState,
  validateState,
} from '@waldur/resource/actions/base';
import { ActionItemType } from '@waldur/resource/actions/types';

import { stopVirtualMachine } from '../api';

const validators = [
  validateState('OK'),
  validateRuntimeState('POWERED_ON', 'SUSPENDED'),
];

export const StopAction: ActionItemType = ({ resource, refetch }) => (
  <AsyncActionItem
    title={translate('Stop')}
    resource={resource}
    validators={validators}
    apiMethod={stopVirtualMachine}
    refetch={refetch}
  />
);
