import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import {
  marketplaceProviderOfferingsRetrieve,
  marketplaceResourcesOfferingRetrieve,
  Resource,
} from 'waldur-js-client';

import { SHORT_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
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
  } = useQuery({
    queryKey: [
      'resource-offering-components',
      resource.uuid,
      useProviderEndpoint ? 'provider' : 'customer',
    ],
    queryFn: () => {
      if (useProviderEndpoint) {
        return marketplaceProviderOfferingsRetrieve({
          path: { uuid: resource.offering_uuid },
          // @ts-ignore
          query: { field: ['components'] },
        }).then((response) => response.data);
      }

      return marketplaceResourcesOfferingRetrieve({
        path: { uuid: resource.uuid },
        // @ts-ignore
        query: { field: ['components'] },
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
    <Row className="field-row mb-1">
      {offering.components.map((component) => (
        <Col key={component.type} xs={2}>
          <ResourceComponentItem resource={resource} component={component} />
        </Col>
      ))}
    </Row>
  );
};
