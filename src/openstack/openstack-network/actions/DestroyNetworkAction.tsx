import { openstackNetworksDestroy } from 'waldur-js-client';

import { validateState } from '@/resource/actions/base';
import { DestroyActionItem } from '@/resource/actions/DestroyActionItem';
import { ActionItemType } from '@/resource/actions/types';

import { validateNetworkOwnerAction } from './validators';

const validators = [validateState('OK', 'ERRED'), validateNetworkOwnerAction];

export const DestroyNetworkAction: ActionItemType = ({ resource, refetch }) => (
  <DestroyActionItem
    validators={validators}
    resource={resource}
    apiMethod={(id) => openstackNetworksDestroy({ path: { uuid: id } })}
    refetch={refetch}
  />
);
