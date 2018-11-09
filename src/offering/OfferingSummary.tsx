import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { connectAngularComponent } from '@waldur/store/connect';

import { OfferingHeader } from './OfferingHeader';
import { OfferingTabs } from './OfferingTabs';
import { Offering } from './types';

interface OfferingSummaryProps {
  offering: Offering;
  summary?: string;
}

const OfferingSummary: React.SFC<OfferingSummaryProps> = props => (
  <div className="wrapper wrapper-content">
    <div className="ibox-content">
      <Row>
        <Col lg={12}>
          <OfferingHeader offering={props.offering} summary={props.summary}/>
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

export default connectAngularComponent(OfferingSummary, ['offering', 'summary']);
