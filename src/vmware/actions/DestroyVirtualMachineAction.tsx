import { vmwareVirtualMachineDestroy } from 'waldur-js-client';

import { validateRuntimeState, validateState } from '@/resource/actions/base';
import { DestroyActionItem } from '@/resource/actions/DestroyActionItem';
import { ActionItemType } from '@/resource/actions/types';

const validators = [
  validateState('OK', 'ERRED'),
  validateRuntimeState('POWERED_OFF'),
];

export const DestroyVirtualMachineAction: ActionItemType = ({
  resource,
  refetch,
}) => (
  <DestroyActionItem
    validators={validators}
    resource={resource}
    apiMethod={(id) => vmwareVirtualMachineDestroy({ path: { uuid: id } })}
    refetch={refetch}
  />
);
