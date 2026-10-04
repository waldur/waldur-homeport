import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { marketplaceProjectMetricsList } from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';
import { useProject } from '@/workspace/hooks';

import { MetricCard } from './MetricCard';

export const ProjectMetricsPage: FC = () => {
  const project = useProject();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['project-metrics', project?.uuid],
    queryFn: () =>
      marketplaceProjectMetricsList({
        query: { project_uuid: project.uuid },
      }).then((response) => response.data),
    enabled: Boolean(project),
  });

  if (!project || isLoading) return <LoadingSpinner />;
  if (error) return <LoadingErred loadData={refetch} />;
  if (!data?.length) {
    return (
      <NoResult
        title={translate('No metrics yet')}
        message={translate(
          "The services this project uses haven't adopted any metrics.",
        )}
        callback={refetch}
        buttonTitle={translate('Search again')}
      />
    );
  }
  return (
    <Row className="g-6">
      {data.map((item) => (
        <Col key={item.offering_metric.uuid} xs={12} lg={6}>
          <MetricCard item={item} project={project} refetch={refetch} />
        </Col>
      ))}
    </Row>
  );
};
