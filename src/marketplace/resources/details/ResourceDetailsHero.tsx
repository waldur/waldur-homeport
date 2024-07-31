import { PublicDashboardHero2 } from '@waldur/dashboard/hero/PublicDashboardHero2';
import { INSTANCE_TYPE, VOLUME_TYPE } from '@waldur/openstack/constants';
import { formatResourceType } from '@waldur/resource/utils';

import { OrderErredView } from '../resource-pending/OrderErredView';
import { OrderInProgressView } from '../resource-pending/OrderInProgressView';
import { ResourceActions } from '../ResourceActions';

import { getMarketplaceResourceLogo } from './MarketplaceResourceLogo';
import { InstanceComponents } from './openstack-instance/InstanceComponents';
import { RefreshButton } from './RefreshButton';
import { ResourceComponents } from './ResourceComponents';
import { ResourceDetailsHeaderBody } from './ResourceDetailsHeaderBody';
import { ResourceDetailsHeaderTitle } from './ResourceDetailsHeaderTitle';
import { ResourceShowMoreComponents } from './ResourceShowMoreComponents';
import { VolumeComponents } from './VolumeComponents';

export const ResourceDetailsHero = ({
  resource,
  scope,
  offering,
  components,
  refetch,
  isLoading,
}) => {
  return (
    <>
      {resource.order_in_progress ? (
        <OrderInProgressView resource={resource} refetch={refetch} />
      ) : resource.creation_order ? (
        <OrderErredView resource={resource} />
      ) : null}
      <PublicDashboardHero2
        className="container-fluid mb-8 mt-6"
        logo={getMarketplaceResourceLogo(resource)}
        logoAlt={resource.category_title}
        logoTooltip={formatResourceType(resource)}
        backgroundImage={offering.image}
        title={<ResourceDetailsHeaderTitle resource={resource} />}
        quickActions={
          <div className="d-flex flex-column flex-wrap gap-2">
            <RefreshButton refetch={refetch} isLoading={isLoading} />
            <ResourceActions
              resource={{
                ...resource,
                marketplace_resource_uuid: resource.uuid,
              }}
              scope={scope}
              refetch={refetch}
              labeled
            />
          </div>
        }
        quickBody={
          resource.offering_type === INSTANCE_TYPE ? (
            scope && <InstanceComponents resource={scope} />
          ) : resource.offering_type === VOLUME_TYPE ? (
            scope && <VolumeComponents resource={scope} />
          ) : (
            <ResourceComponents resource={resource} components={components} />
          )
        }
        quickFooter={
          components?.length > 4 ? (
            <ResourceShowMoreComponents
              resource={resource}
              components={components}
            />
          ) : null
        }
      >
        <ResourceDetailsHeaderBody resource={resource} offering={offering} />
      </PublicDashboardHero2>
    </>
  );
};
