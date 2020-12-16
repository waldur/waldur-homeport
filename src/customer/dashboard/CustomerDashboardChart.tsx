import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { EChart } from '@waldur/core/EChart';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { DashboardCounter } from '@waldur/dashboard/DashboardCounter';
import { Customer, User } from '@waldur/workspace/types';

import { loadSummary } from './api';
import { CustomerActions } from './CustomerActions';

interface CustomerDashboardProps {
  user: User;
  customer: Customer;
}

export const CustomerDashboardChart: FunctionComponent<CustomerDashboardProps> = ({
  customer,
  user,
}) => {
  const { loading, value } = useAsync(() => loadSummary(customer), [customer]);
  if (loading) {
    return <LoadingSpinner />;
  }
  if (Array.isArray(value)) {
    return (
      <div style={{ paddingLeft: 10 }}>
        <Row>
          {value.map((item, index) => (
            <Col key={index} md={4}>
              <DashboardCounter
                label={item.chart.title}
                value={item.chart.current}
              />
              <EChart options={item.options} height="100px" />
            </Col>
          ))}
          <Col md={4}>
            <CustomerActions customer={customer} user={user} />
          </Col>
        </Row>
      </div>
    );
  }
  return null;
};
