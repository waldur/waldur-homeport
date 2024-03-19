import { FunctionComponent } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { EChart } from '@waldur/core/EChart';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { ServiceProvider } from '@waldur/marketplace/types';

import { loadProviderCharts } from './api';
import { ChangesAmountBadge } from './ChangesAmountBadge';

interface ProviderDashboardChartProps {
  provider: ServiceProvider;
}

export const ProviderDashboardChart: FunctionComponent<ProviderDashboardChartProps> =
  ({ provider }) => {
    const { loading, value } = useAsync(
      () => loadProviderCharts(provider),
      [provider],
    );
    if (loading) {
      return <LoadingSpinner />;
    }
    if (Array.isArray(value) && value[0]) {
      return (
        <Card className="min-h-225px mb-6">
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
