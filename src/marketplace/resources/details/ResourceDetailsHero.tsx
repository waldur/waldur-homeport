import {
  OfferingComponent,
  PublicOfferingDetails,
  Resource,
} from 'waldur-js-client';

import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
import { RefreshButton } from '@waldur/marketplace/common/RefreshButton';
import { INSTANCE_TYPE, VOLUME_TYPE } from '@waldur/openstack/constants';
import { formatResourceType } from '@waldur/resource/utils';

import { OrderErredView } from '../resource-pending/OrderErredView';
import { OrderInProgressView } from '../resource-pending/OrderInProgressView';
import { ResourceActions } from '../ResourceActions';

import { getMarketplaceResourceLogo } from './MarketplaceResourceLogo';
import { InstanceComponents } from './openstack-instance/InstanceComponents';
import { ResourceComponents } from './ResourceComponents';
import { ResourceDetailsHeaderBody } from './ResourceDetailsHeaderBody';
import { ResourceDetailsHeaderTitle } from './ResourceDetailsHeaderTitle';
import { ResourceEndDateConflictBar } from './ResourceEndDateConflictBar';
import { VolumeComponents } from './VolumeComponents';

export const ResourceDetailsHero = ({
  resource,
  scope,
  offering,
  components,
  refetch,
  isLoading,
}: {
  resource: Resource;
  scope;
  offering: PublicOfferingDetails;
  components: OfferingComponent[];
  refetch;
  isLoading;
}) => {
  return (
    <>
      {resource.end_date &&
        resource.project_end_date &&
        resource.end_date > resource.project_end_date && (
          <ResourceEndDateConflictBar />
        )}
      {resource.order_in_progress ? (
        <OrderInProgressView resource={resource} refetch={refetch} />
      ) : resource.creation_order ? (
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
          <div className="d-flex flex-column flex-wrap gap-2 w-sm-120px">
            <RefreshButton refetch={refetch} isLoading={isLoading} size="sm" />
            <ResourceActions
              resource={{
                ...resource,
                marketplace_resource_uuid: resource.uuid,
              }}
              scope={scope}
              refetch={refetch}
              labeled
              drop="down"
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
      >
        <ResourceDetailsHeaderBody resource={resource} offering={offering} />
      </PublicDashboardHero>
    </>
  );
};
