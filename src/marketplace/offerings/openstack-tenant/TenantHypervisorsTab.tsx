import { FunctionComponent, useMemo } from 'react';
import {
  OpenstackHypervisorsListData,
  ProviderOfferingDetails,
} from 'waldur-js-client';

import { HypervisorsTab } from '@waldur/openstack/openstack-hypervisors/HypervisorsTab';

export const TenantHypervisorsTab: FunctionComponent<{
  offering: ProviderOfferingDetails;
}> = ({ offering }) => {
  const filter = useMemo(
    (): OpenstackHypervisorsListData['query'] => ({
      settings_uuid: offering.scope_uuid ?? '',
    }),
    [offering.scope_uuid],
  );
  return <HypervisorsTab filter={filter} />;
};
