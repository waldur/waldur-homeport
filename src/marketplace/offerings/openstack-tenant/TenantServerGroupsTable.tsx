import { FunctionComponent, useMemo } from 'react';
import { OpenstackServerGroupsListData } from 'waldur-js-client';

import { OfferingServerGroupsList } from '@waldur/openstack/openstack-server-groups/OfferingServerGroupsList';

export const TenantServerGroupsTable: FunctionComponent<{ offering }> = ({
  offering,
}) => {
  const filter = useMemo(
    (): OpenstackServerGroupsListData['query'] => ({
      service_settings_uuid: offering.scope_uuid,
    }),
    [offering],
  );
  return <OfferingServerGroupsList filter={filter} />;
};
