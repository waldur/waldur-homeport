import React from 'react';
import { Col, Row } from 'react-bootstrap';

import {
  OfferingTabsComponent,
  OfferingTab,
} from '@waldur/marketplace/details/OfferingTabsComponent';
import { Offering } from '@waldur/marketplace/types';

import { OfferingActions } from '../actions/OfferingActions';

import { OfferingHeader } from './OfferingHeader';

interface OfferingDetailsProps {
  offering: Offering;
  tabs: OfferingTab[];
}

export const OfferingDetails: React.FC<OfferingDetailsProps> = (props) => (
  <div className="wrapper wrapper-content">
    {props.offering.shared && (
      <div
        className="pull-right m-r-md"
        style={{ position: 'relative', zIndex: 100 }}
      >
        <OfferingActions offering={props.offering} />
      </div>
    )}
    <OfferingHeader offering={props.offering} />
    <Row>
      <Col lg={12} style={{ overflow: 'auto' }}>
        <OfferingTabsComponent tabs={props.tabs} />
      </Col>
    </Row>
  </div>
);
