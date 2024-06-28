import { Col, Row } from 'react-bootstrap';

import { ProviderDashboardChart } from './ProviderDashboardChart';
import { ProviderWidgets } from './ProviderWidgets';

export const ProviderDashboard = ({ provider }) =>
  provider ? (
    <Row>
      <Col md={12} lg={6}>
        <ProviderDashboardChart provider={provider} />
      </Col>
      <Col md={12} lg={6}>
        <ProviderWidgets provider={provider} />
      </Col>
    </Row>
  ) : null;
