import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { translate } from '@waldur/i18n';
import { Offering, Category } from '@waldur/marketplace/types';

import { OfferingConfigurator } from './OfferingConfigurator';
import './OfferingDetails.scss';
import { OfferingTabs } from './OfferingTabs';
import { OrderSummary } from './OrderSummary';

interface OfferingDetailsProps {
  offering: Offering;
  category: Category;
}

export const OfferingDetails = (props: OfferingDetailsProps) => (
  <>
    {props.offering.description && (
      <div className="bs-callout bs-callout-success">
        {props.offering.description}
      </div>
    )}
    <Row className="offering-details-section">
      <Col md={9}>
        <h3 className="header-bottom-border">
          {translate('Product configuration')}
        </h3>
        <OfferingConfigurator offering={props.offering}/>
      </Col>
      <Col md={3}>
        <h3 className="header-bottom-border">
          {translate('Order summary')}
        </h3>
        <OrderSummary offering={props.offering}/>
      </Col>
    </Row>
    <OfferingTabs
      offering={props.offering}
      sections={props.category.sections}
    />
  </>
);
