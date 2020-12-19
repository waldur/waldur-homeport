import { FunctionComponent } from 'react';

import { ResourceUsageTabsContainer } from '@waldur/marketplace/resources/usage/ResourceUsageTabsContainer';

export const OpenStackResourceUsage: FunctionComponent<{ resource }> = ({
  resource,
}) => (
  <ResourceUsageTabsContainer
    offeringUuid={resource.marketplace_offering_uuid}
    resourceUuid={resource.marketplace_resource_uuid}
  />
);
