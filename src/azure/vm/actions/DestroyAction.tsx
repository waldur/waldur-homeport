import { destroyVirtualMachine } from '@waldur/azure/api';
import { validateState } from '@waldur/resource/actions/base';
import { DestroyActionItem } from '@waldur/resource/actions/DestroyActionItem';

const validators = [validateState('OK', 'Erred')];

export const DestroyAction = ({ resource }) => (
  <DestroyActionItem
    resource={resource}
    validators={validators}
    apiMethod={destroyVirtualMachine}
  />
);
