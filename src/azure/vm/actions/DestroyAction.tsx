import { azureVirtualmachinesDestroy } from 'waldur-js-client';

import { validateState } from '@/resource/actions/base';
import { DestroyActionItem } from '@/resource/actions/DestroyActionItem';
import { ActionItemType } from '@/resource/actions/types';

const validators = [validateState('OK', 'ERRED')];

export const DestroyAction: ActionItemType = ({ resource, refetch }) => (
  <DestroyActionItem
    resource={resource}
    validators={validators}
    apiMethod={(id) => azureVirtualmachinesDestroy({ path: { uuid: id } })}
    refetch={refetch}
  />
);
