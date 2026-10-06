import { openstackNetworksPull } from 'waldur-js-client';

import { PullActionItem } from '@/resource/actions/PullActionItem';
import { ActionItemType } from '@/resource/actions/types';

import { validateNetworkOwnerAction } from './validators';

const validators = [validateNetworkOwnerAction];

export const PullNetworkAction: ActionItemType = ({ resource, refetch }) => (
  <PullActionItem
    apiMethod={(uuid: string) => openstackNetworksPull({ path: { uuid } })}
    resource={resource}
    refetch={refetch}
    validators={validators}
  />
);
