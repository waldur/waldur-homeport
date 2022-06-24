import { FunctionComponent } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { EChart } from '@waldur/core/EChart';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Customer, User } from '@waldur/workspace/types';

import { loadSummary } from './api';

interface CustomerDashboardProps {
  user: User;
  customer: Customer;
}

export const CustomerDashboardChart: FunctionComponent<CustomerDashboardProps> =
  ({ customer }) => {
    const { loading, value } = useAsync(
      () => loadSummary(customer),
      [customer],
    );
    if (loading) {
      return <LoadingSpinner />;
    }
    if (Array.isArray(value)) {
      return (
        <Row className="mb-6">
          {value.map((item, index) => (
            <Col key={index} md={6} sm={12} className="mb-md-0 mb-sm-6">
              <Card>
                <Card.Body>
                  <Row>
                    <Col xs={7}>
                      <EChart options={item.options} height="100px" />
                    </Col>
                    <Col>
                      <h1 className="fw-bold">{item.chart.current}</h1>
                      <h5 className="fw-bold text-uppercase">
                        {item.chart.title}
                      </h5>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      );
    }
    return null;
  };
