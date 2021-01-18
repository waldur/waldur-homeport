import { ENV } from '@waldur/configs/default';
import { destroyNode } from '@waldur/rancher/api';
import { validateState } from '@waldur/resource/actions/base';
import { DestroyActionItem } from '@waldur/resource/actions/DestroyActionItem';

const validators = [validateState('OK', 'Erred')];

export const DestroyAction = ({ resource }) =>
  !ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE ? (
    <DestroyActionItem
      validators={validators}
      resource={resource}
      apiMethod={destroyNode}
    />
  ) : null;
