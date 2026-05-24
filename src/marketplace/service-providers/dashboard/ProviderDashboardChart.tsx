import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { EChart } from '@/core/EChart';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { ServiceProvider } from '@/marketplace/types';

import { ChangesAmountBadge } from './ChangesAmountBadge';
import { loadProviderCharts } from './utils';

interface ProviderDashboardChartProps {
  provider: ServiceProvider;
}

export const ProviderDashboardChart: FunctionComponent<
  ProviderDashboardChartProps
> = ({ provider }) => {
  const { isLoading: loading, data: value } = useQuery({
    queryKey: ['ProviderDashboardChart', provider],
    queryFn: () => loadProviderCharts(provider),
  });
  if (loading) {
    return <LoadingSpinner />;
  }
  if (Array.isArray(value) && value[0]) {
    return (
      <Card className="card-bordered min-h-225px mb-5">
        <Card.Body>
          <Row>
            <Col xs={7}>
              <EChart options={value[0].options} height="100px" />
            </Col>
            <Col>
              <h1 className="fw-bold">{value[0].chart.current}</h1>
              <h5 className="fw-bold text-uppercase mb-5">
                {value[0].chart.title}
              </h5>
              <ChangesAmountBadge
                changes={value[0].chart.changes}
                showOnInfinity
                showOnZero
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  }
  return null;
};
