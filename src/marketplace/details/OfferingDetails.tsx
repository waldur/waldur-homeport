import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { translate } from '@waldur/i18n';
import { getCheckoutSummaryComponent } from '@waldur/marketplace/common/registry';
import { OrderSummary } from '@waldur/marketplace/details/OrderSummary';
import { Offering } from '@waldur/marketplace/types';

import { OfferingConfigurator } from './OfferingConfigurator';
import './OfferingDetails.scss';
import { OfferingTabsComponent, OfferingTab } from './OfferingTabsComponent';

interface OfferingDetailsProps {
  offering: Offering;
  tabs: OfferingTab[];
  limits: string[];
}

export const OfferingDetails = (props: OfferingDetailsProps) => {
  const CheckoutSummaryComponent = getCheckoutSummaryComponent(props.offering.type);
  return (
    <>
      {props.offering.description && (
        <div className="bs-callout bs-callout-success">
          {props.offering.description}
        </div>
      )}
      <Row>
        <Col md={9}>
          <h3 className="header-bottom-border">
            {translate('Product configuration')}
          </h3>
          <OfferingConfigurator
            offering={props.offering}
            limits={props.limits}
          />
        </Col>
        <Col md={3}>
          <h3 className="header-bottom-border">
            {translate('Order summary')}
          </h3>
          {CheckoutSummaryComponent ?
            <CheckoutSummaryComponent {...props} /> :
            <OrderSummary offering={props.offering}/>
          }
        </Col>
      </Row>
      <OfferingTabsComponent tabs={props.tabs}/>
    </>
  );
};
