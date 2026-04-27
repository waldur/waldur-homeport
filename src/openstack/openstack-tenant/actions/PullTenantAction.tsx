import { openstackTenantsPull } from 'waldur-js-client';

import { PullActionItem } from '@/resource/actions/PullActionItem';
import { ActionItemType } from '@/resource/actions/types';

export const PullTenantAction: ActionItemType = ({ resource, ...rest }) => (
  <PullActionItem
    apiMethod={(uuid: string) => openstackTenantsPull({ path: { uuid } })}
    resource={resource}
    {...rest}
  />
);
