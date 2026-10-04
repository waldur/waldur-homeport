import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { marketplaceResourceMetricsList, Resource } from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import { MetricCard } from './MetricCard';

/** One resource's own figures for the metrics its offering reports. */
export const ResourceMetricsTab: FC<{ resource: Resource }> = ({
  resource,
}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['resource-metrics', resource.uuid],
    queryFn: () =>
      marketplaceResourceMetricsList({
        query: { resource_uuid: resource.uuid },
      }).then((response) => response.data),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <LoadingErred loadData={refetch} />;
  if (!data?.length) {
    return (
      <NoResult
        title={translate('No metrics yet')}
        message={translate(
          "This resource's service hasn't adopted any metrics.",
        )}
        callback={refetch}
        buttonTitle={translate('Search again')}
      />
    );
  }
  return (
    <>
      <p className="text-muted mb-6">
        {translate(
          "This resource's own figures. Goals apply to the project's combined figure, on the project's Metrics tab.",
        )}
      </p>
      <Row className="g-6">
        {data.map((item) => (
          <Col key={item.offering_metric.uuid} xs={12} lg={6}>
            <MetricCard
              item={item}
              resourceUuid={resource.uuid}
              refetch={refetch}
            />
          </Col>
        ))}
      </Row>
    </>
  );
};
