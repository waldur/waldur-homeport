import { openstackSecurityGroupsPull } from 'waldur-js-client';

import { PullActionItem } from '@/resource/actions/PullActionItem';
import { ActionItemType } from '@/resource/actions/types';

export const PullSecurityGroupAction: ActionItemType = ({
  resource,
  refetch,
}) => (
  <PullActionItem
    apiMethod={(uuid: string) =>
      openstackSecurityGroupsPull({ path: { uuid } })
    }
    resource={resource}
    refetch={refetch}
  />
);
