import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { FeaturesTab } from './FeaturesTab';
import { LeafletMap } from './LeafletMap';

export const SecurityTab = props => (
  <Row>
    <Col md={4}>
      <h4 className="header-bottom-border">
        Provider location
      </h4>
      <LeafletMap/>
    </Col>
    <Col md={8}>
      <h4 className="header-bottom-border">
        Security features
      </h4>
      <FeaturesTab product={props.product} sections={props.sections}/>
    </Col>
  </Row>
);
