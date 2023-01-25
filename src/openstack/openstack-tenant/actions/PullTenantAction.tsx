import { pullTenant } from '@waldur/openstack/api';
import { PullActionItem } from '@waldur/resource/actions/PullActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

export const PullTenantAction: ActionItemType = ({ resource, ...rest }) => (
  <PullActionItem apiMethod={pullTenant} resource={resource} {...rest} />
);
