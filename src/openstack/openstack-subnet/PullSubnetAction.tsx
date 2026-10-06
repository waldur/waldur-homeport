import { openstackSubnetsPull } from 'waldur-js-client';

import { PullActionItem } from '@/resource/actions/PullActionItem';
import { ActionItemType } from '@/resource/actions/types';

import { validateSubnetOwnerAction } from './validators';

const validators = [validateSubnetOwnerAction];

export const PullSubnetAction: ActionItemType = ({ resource, refetch }) => (
  <PullActionItem
    apiMethod={(uuid: string) => openstackSubnetsPull({ path: { uuid } })}
    resource={resource}
    refetch={refetch}
    validators={validators}
  />
);
