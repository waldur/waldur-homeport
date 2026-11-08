import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import {
  marketplaceProviderOfferingsRetrieve,
  marketplaceResourcesOfferingRetrieve,
  Resource,
  ProviderOfferingDetails,
  PublicOfferingDetails,
} from 'waldur-js-client';

import { SHORT_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import {
  findResourcePlan,
  resolvePlanComponents,
} from '@/marketplace/details/plan/effectiveComponents';
import { ResourceComponentItem } from '@/marketplace/resources/details/ResourceComponentItem';

interface ResourceComponentsSummaryProps {
  resource: Resource;
  context?: 'provider' | 'customer';
}

export const ResourceComponentsSummary: FC<ResourceComponentsSummaryProps> = ({
  resource,
  context = 'customer',
}) => {
  const useProviderEndpoint = context === 'provider';

  const {
    data: offering,
    isLoading,
    error,
    refetch,
  } = useQuery<
    Pick<
      ProviderOfferingDetails | PublicOfferingDetails,
      'components' | 'plans'
    >
  >({
    queryKey: [
      'resource-offering-components',
      resource.uuid,
      useProviderEndpoint ? 'provider' : 'customer',
    ],
    queryFn: () => {
      if (useProviderEndpoint) {
        return marketplaceProviderOfferingsRetrieve({
          path: { uuid: resource.offering_uuid },
          query: { field: ['components', 'plans'] },
        }).then((response) => response.data);
      }

      return marketplaceResourcesOfferingRetrieve({
        path: { uuid: resource.uuid },
        query: { field: ['components', 'plans'] },
      }).then((response) => response.data);
    },
    refetchOnWindowFocus: false,
    staleTime: SHORT_STALE_TIME,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  if (!offering?.components?.length) {
    return null;
  }

  return (
    // The summary sits in an expanded table row, so its width is the table's,
    // not the viewport's: size the columns against the container. Six fixed
    // columns leave ~55px each on a phone, which cuts every title and figure
    // down to an ellipsis.
    <div className="@container mb-1">
      <div
        data-slot="resource-components-grid"
        className="grid grid-cols-1 gap-x-5 @sm:grid-cols-2 @xl:grid-cols-3 @3xl:grid-cols-4 @min-[1000px]:grid-cols-6"
      >
        {resolvePlanComponents(
          offering.components,
          findResourcePlan(offering.plans, resource.plan_uuid),
        ).map((component) => (
          <div key={component.type}>
            <ResourceComponentItem resource={resource} component={component} />
          </div>
        ))}
      </div>
    </div>
  );
};
