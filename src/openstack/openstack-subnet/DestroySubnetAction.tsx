import { openstackSubnetsDestroy } from 'waldur-js-client';

import { validateState } from '@/resource/actions/base';
import { DestroyActionItem } from '@/resource/actions/DestroyActionItem';
import { ActionItemType } from '@/resource/actions/types';

const validators = [validateState('OK', 'ERRED')];

export const DestroySubnetAction: ActionItemType = ({ resource, refetch }) => (
  <DestroyActionItem
    validators={validators}
    resource={resource}
    apiMethod={(id) => openstackSubnetsDestroy({ path: { uuid: id } })}
    refetch={refetch}
  />
);
