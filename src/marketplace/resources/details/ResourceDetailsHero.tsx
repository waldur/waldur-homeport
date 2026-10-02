import {
  OfferingComponent,
  PublicOfferingDetails,
  Resource,
} from 'waldur-js-client';

import { PublicDashboardHero } from '@/dashboard/hero/PublicDashboardHero';
import { RefreshButton } from '@/marketplace/common/RefreshButton';
import { INSTANCE_TYPE, VOLUME_TYPE } from '@/openstack/constants';
import { formatResourceType } from '@/resource/utils';

import { ProviderResourceActions } from '../list/ProviderResourceActions';
import { OrderErredView } from '../resource-pending/OrderErredView';
import { OrderInProgressView } from '../resource-pending/OrderInProgressView';
import { ResourceActions } from '../ResourceActions';

import { getMarketplaceResourceLogo } from './MarketplaceResourceLogo';
import { InstanceComponents } from './openstack-instance/InstanceComponents';
import { ResourceDetailsAction } from './popup/ResourceDetailsAction';
import { ResourceComponents } from './ResourceComponents';
import { ResourceDetailsHeaderBody } from './ResourceDetailsHeaderBody';
import { ResourceDetailsHeaderTitle } from './ResourceDetailsHeaderTitle';
import { ResourceEndDateConflictBar } from './ResourceEndDateConflictBar';
import { useIsResourceProjectOnlyViewer } from './useIsResourceProjectOnlyViewer';
import { VolumeComponents } from './VolumeComponents';

// The page already shows the resource's details.
const DETAILS_PAGE_EXCLUDED_ACTIONS = [ResourceDetailsAction];

export const ResourceDetailsHero = ({
  resource,
  scope,
  offering,
  components,
  refetch,
  isLoading,
  providerView = false,
}: {
  resource: Resource;
  scope;
  offering: PublicOfferingDetails;
  components: OfferingComponent[];
  refetch;
  isLoading;
  providerView?: boolean;
}) => {
  const rpOnlyViewer = useIsResourceProjectOnlyViewer(resource);
  const isRPOnly = !providerView && rpOnlyViewer;
  return (
    <div
      className={offering.state === 'Unavailable' ? 'disabled-view' : undefined}
    >
      {resource.end_date &&
        resource.resource_effective_end_date &&
        resource.end_date > resource.resource_effective_end_date && (
          <ResourceEndDateConflictBar />
        )}
      {resource.order_in_progress ? (
        <OrderInProgressView
          resource={resource}
          offering={offering}
          refetch={refetch}
          providerView={providerView}
        />
      ) : resource.creation_order && !providerView ? (
        <OrderErredView resource={resource} />
      ) : null}
      <PublicDashboardHero
        containerClassName="container-fluid my-5"
        cardBordered
        logo={getMarketplaceResourceLogo(resource)}
        logoAlt={resource.category_title}
        logoTooltip={formatResourceType(resource)}
        logoCircle
        backgroundImage={offering.image}
        title={<ResourceDetailsHeaderTitle resource={resource} />}
        quickActions={
          isRPOnly ? null : (
            <div className="d-flex flex-column flex-wrap gap-2 w-sm-120px">
              <RefreshButton
                refetch={refetch}
                isLoading={isLoading}
                size="sm"
              />
              {providerView ? (
                <ProviderResourceActions
                  resource={resource}
                  excludeActions={DETAILS_PAGE_EXCLUDED_ACTIONS}
                  refetch={refetch}
                  labeled
                  drop="down"
                  disabled={offering.state === 'Unavailable'}
                  size="sm"
                />
              ) : (
                <ResourceActions
                  resource={{
                    ...resource,
                    marketplace_resource_uuid: resource.uuid,
                  }}
                  scope={scope}
                  refetch={refetch}
                  labeled
                  drop="down"
                  disabled={offering.state === 'Unavailable'}
                  size="sm"
                />
              )}
            </div>
          )
        }
        quickBody={
          isRPOnly ? null : resource.offering_type === INSTANCE_TYPE ? (
            scope && <InstanceComponents resource={scope} />
          ) : resource.offering_type === VOLUME_TYPE ? (
            scope && <VolumeComponents resource={scope} />
          ) : (
            <ResourceComponents resource={resource} components={components} />
          )
        }
      >
        <ResourceDetailsHeaderBody
          resource={resource}
          offering={offering}
          providerView={providerView}
        />
      </PublicDashboardHero>
    </div>
  );
};
