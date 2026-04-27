import { rancherNodesDestroy } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { validateState } from '@/resource/actions/base';
import { DestroyActionItem } from '@/resource/actions/DestroyActionItem';
import { ActionItemType } from '@/resource/actions/types';

const validators = [validateState('OK', 'ERRED')];

export const DestroyAction: ActionItemType = ({ resource, refetch }) =>
  !ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE ? (
    <DestroyActionItem
      validators={validators}
      resource={resource}
      apiMethod={(id) => rancherNodesDestroy({ path: { uuid: id } })}
      refetch={refetch}
    />
  ) : null;
