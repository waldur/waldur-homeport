import { FunctionComponent } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { translate } from '@waldur/i18n';
import { OFFERING_TYPE_CUSTOM_SCRIPTS } from '@waldur/marketplace-script/constants';
import { getCheckoutSummaryComponent } from '@waldur/marketplace/common/registry';
import { OrderSummary } from '@waldur/marketplace/details/OrderSummary';
import { Offering } from '@waldur/marketplace/types';
import {
  INSTANCE_TYPE,
  SHARED_INSTANCE_TYPE,
  VOLUME_TYPE,
} from '@waldur/openstack/constants';
import { BASIC_OFFERING_TYPE } from '@waldur/support/constants';

import { DeployPage } from '../deploy/DeployPage';

import { OfferingConfigurator } from './OfferingConfigurator';
import { OfferingTab, OfferingTabsComponent } from './OfferingTabsComponent';

import './OfferingDetails.scss';

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
  return [
    INSTANCE_TYPE,
    SHARED_INSTANCE_TYPE,
    OFFERING_TYPE_CUSTOM_SCRIPTS,
    BASIC_OFFERING_TYPE,
    VOLUME_TYPE,
  ].includes(props.offering.type) ? (
    <DeployPage offering={props.offering} limits={props.limits} />
  ) : (
    <>
      <Row>
        <Col md={9}>
          <Card>
            <Card.Body>
              <h3 className="header-bottom-border">
                {translate('Offering configuration')}
              </h3>
              <OfferingConfigurator
                offering={props.offering}
                limits={props.limits}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          {props.offering.description && (
            <Card className="mb-6">
              <Card.Body>
                <h3 className="header-bottom-border">
                  {translate('Offering description')}
                </h3>
                <div className="bs-callout bs-callout-success">
                  <FormattedHtml html={props.offering.description} />
                </div>
              </Card.Body>
            </Card>
          )}
          <Card>
            <Card.Body>
              <h3 className="header-bottom-border">
                {translate('Order summary')}
              </h3>
              {CheckoutSummaryComponent ? (
                <CheckoutSummaryComponent {...props} />
              ) : (
                <OrderSummary offering={props.offering} />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mt-6">
        <Col md={12}>
          <Card>
            <Card.Body>
              <OfferingTabsComponent tabs={props.tabs} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};
