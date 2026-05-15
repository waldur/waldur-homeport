import { openstackPoolsPull } from 'waldur-js-client';

import { PullActionItem } from '@/resource/actions/PullActionItem';
import { ActionItemType } from '@/resource/actions/types';

export const PullPoolAction: ActionItemType = ({ resource, refetch }) => (
  <PullActionItem
    apiMethod={(uuid) => openstackPoolsPull({ path: { uuid } })}
    resource={resource}
    refetch={refetch}
  />
);
