import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { getResourceOffering } from '@waldur/marketplace/common/api';
import { ResourceComponentItem } from '@waldur/marketplace/resources/details/ResourceComponents';
import { Resource } from '@waldur/marketplace/resources/types';

interface ResourceComponentsSummaryProps {
  resource: Resource;
}

export const ResourceComponentsSummary: FC<ResourceComponentsSummaryProps> = ({
  resource,
}) => {
  const {
    data: offering,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['resource-offering-components', resource.uuid],
    () =>
      getResourceOffering(resource.uuid, { params: { field: ['components'] } }),
    { refetchOnWindowFocus: false, staleTime: 60 * 1000 },
  );

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
