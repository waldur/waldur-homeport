import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import useAsync from 'react-use/lib/useAsync';

import { EChart } from '@waldur/core/EChart';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Panel } from '@waldur/core/Panel';
import { CategoryResourcesList } from '@waldur/dashboard/CategoryResourcesList';
import { DashboardCounter } from '@waldur/dashboard/DashboardCounter';
import { DashboardHeader } from '@waldur/dashboard/DashboardHeader';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { User, Customer } from '@waldur/workspace/types';

import { loadSummary } from './api';
import { CustomerActions } from './CustomerActions';
import { CustomerResourcesList } from './CustomerResourcesList';

interface CustomerDashboardProps {
  user: User;
  customer: Customer;
}

export const CustomerDashboard = (props: CustomerDashboardProps) => {
  const { loading, value } = useAsync(() => loadSummary(props.customer), [
    props.customer,
  ]);

  return (
    <>
      <DashboardHeader
        title={translate('Welcome, {user}!', { user: props.user.full_name })}
        subtitle={translate('Overview of {organization} organization', {
          organization: props.customer.name,
        })}
      />
      {loading ? (
        <LoadingSpinner />
      ) : Array.isArray(value) ? (
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
              <CustomerActions customer={props.customer} user={props.user} />
            </Col>
          </Row>
        </div>
      ) : null}
      <>
        <Panel title={translate('Resources')}>
          <CustomerResourcesList />
        </Panel>
        {isFeatureVisible('customer.dashboard.category-resources-list') && (
          <CategoryResourcesList
            scopeType="organization"
            scope={props.customer}
          />
        )}
      </>
    </>
  );
};
