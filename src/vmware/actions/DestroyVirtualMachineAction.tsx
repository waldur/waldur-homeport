import {
  validateRuntimeState,
  validateState,
} from '@waldur/resource/actions/base';
import { DestroyActionItem } from '@waldur/resource/actions/DestroyActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

import { destroyVirtualMachine } from '../api';

const validators = [
  validateState('OK', 'Erred'),
  validateRuntimeState('POWERED_OFF'),
];

export const DestroyVirtualMachineAction: ActionItemType = ({
  resource,
  refetch,
}) => (
  <DestroyActionItem
    validators={validators}
    resource={resource}
    apiMethod={destroyVirtualMachine}
    refetch={refetch}
  />
);
