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
    <div className="field-row grid grid-cols-6 gap-x-5 mb-1">
      {resolvePlanComponents(
        offering.components,
        findResourcePlan(offering.plans, resource.plan_uuid),
      ).map((component) => (
        <div key={component.type}>
          <ResourceComponentItem resource={resource} component={component} />
        </div>
      ))}
    </div>
  );
};
