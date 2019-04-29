import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { EChart } from '@waldur/core/EChart';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import Panel from '@waldur/core/Panel';
import { Query } from '@waldur/core/Query';
import { loadCategories } from '@waldur/dashboard/api';
import { CategoryResourcesList } from '@waldur/dashboard/CategoryResourcesList';
import { DashboardCounter } from '@waldur/dashboard/DashboardCounter';
import { DashboardHeader } from '@waldur/dashboard/DashboardHeader';
import { translate } from '@waldur/i18n';
import { User, Customer } from '@waldur/workspace/types';

import { loadSummary } from './api';
import { CustomerActions } from './CustomerActions';
import { CustomerResourcesList } from './CustomerResourcesList';

interface CustomerDashboardProps {
  user: User;
  customer: Customer;
  marketplaceEnabled: boolean;
}

export const CustomerDashboard = (props: CustomerDashboardProps) => (
  <>
    <DashboardHeader
      title={translate('Welcome, {user}!', {user: props.user.full_name})}
      subtitle={translate('Overview of {organization} organization', {organization: props.customer.name})}
    />
    <Query loader={loadSummary} variables={props.customer}>
      {({ loading, data }) => {
        if (loading) {
          return <LoadingSpinner/>;
        }
        return (
          <div style={{paddingLeft: 10}}>
            <Row>
              {data.map((item, index) => (
                <Col key={index} md={4}>
                  <DashboardCounter
                    label={item.chart.title}
                    value={item.chart.current}
                  />
                  <EChart options={item.options} height="100px" />
                </Col>
              ))}
              <Col md={4}>
                <CustomerActions customer={props.customer} user={props.user}/>
              </Col>
            </Row>
            {props.marketplaceEnabled && (
              <Panel title={translate('Resources')}>
                <CustomerResourcesList/>
              </Panel>
            )}
            <CategoryResourcesList
              loader={(customer: Customer) => loadCategories('organization', customer)}
              scope={props.customer}
            />
          </div>
        );
      }}
    </Query>
  </>
);
