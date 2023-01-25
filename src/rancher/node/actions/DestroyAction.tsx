import { ENV } from '@waldur/configs/default';
import { destroyNode } from '@waldur/rancher/api';
import { validateState } from '@waldur/resource/actions/base';
import { DestroyActionItem } from '@waldur/resource/actions/DestroyActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const validators = [validateState('OK', 'Erred')];

export const DestroyAction: ActionItemType = ({ resource, refetch }) =>
  !ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE ? (
    <DestroyActionItem
      validators={validators}
      resource={resource}
      apiMethod={destroyNode}
      refetch={refetch}
    />
  ) : null;
