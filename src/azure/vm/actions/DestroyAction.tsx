import { destroyVirtualMachine } from '@waldur/azure/api';
import { validateState } from '@waldur/resource/actions/base';
import { DestroyActionItem } from '@waldur/resource/actions/DestroyActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const validators = [validateState('OK', 'Erred')];

export const DestroyAction: ActionItemType = ({ resource, refetch }) => (
  <DestroyActionItem
    resource={resource}
    validators={validators}
    apiMethod={destroyVirtualMachine}
    refetch={refetch}
  />
);
