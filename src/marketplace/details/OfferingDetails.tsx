import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { translate } from '@waldur/i18n';
import { getCheckoutSummaryComponent } from '@waldur/marketplace/common/registry';
import { OrderSummary } from '@waldur/marketplace/details/OrderSummary';
import { Offering } from '@waldur/marketplace/types';

import { OfferingConfigurator } from './OfferingConfigurator';
import './OfferingDetails.scss';
import { OfferingTab, OfferingTabsComponent } from './OfferingTabsComponent';

export interface OfferingDetailsProps {
  offering: Offering;
  tabs: OfferingTab[];
  limits: string[];
}

export const OfferingDetails: FunctionComponent<OfferingDetailsProps> = (
  props,
) => {
  const CheckoutSummaryComponent = getCheckoutSummaryComponent(
    props.offering.type,
  );
  return (
    <>
      {props.offering.description && (
        <div className="bs-callout bs-callout-success">
          <FormattedHtml html={props.offering.description} />
        </div>
      )}
      <Row>
        <Col md={9}>
          <h3 className="header-bottom-border">
            {translate('Offering configuration')}
          </h3>
          <OfferingConfigurator
            offering={props.offering}
            limits={props.limits}
          />
        </Col>
        <Col md={3}>
          <h3 className="header-bottom-border">{translate('Order summary')}</h3>
          {CheckoutSummaryComponent ? (
            <CheckoutSummaryComponent {...props} />
          ) : (
            <OrderSummary offering={props.offering} />
          )}
        </Col>
      </Row>
      <OfferingTabsComponent tabs={props.tabs} />
    </>
  );
};
