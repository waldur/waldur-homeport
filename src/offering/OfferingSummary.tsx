import React from 'react';
import { Col, Row } from 'react-bootstrap';

import { OfferingHeader } from './OfferingHeader';
import { OfferingTabs } from './OfferingTabs';
import { Offering } from './types';

interface OfferingSummaryProps {
  offering: Offering;
  summary?: string;
}

export const OfferingSummary: React.FC<OfferingSummaryProps> = (props) => (
  <div className="wrapper wrapper-content">
    <div className="ibox-content">
      <Row>
        <Col lg={12}>
          <OfferingHeader offering={props.offering} summary={props.summary} />
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <OfferingTabs offering={props.offering} summary={props.summary} />
        </Col>
      </Row>
    </div>
  </div>
);
