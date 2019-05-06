import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { OfferingTabsComponent, OfferingTab } from '@waldur/marketplace/details/OfferingTabsComponent';
import { Offering } from '@waldur/marketplace/types';

import { OfferingActions } from '../actions/OfferingActions';
import { OfferingHeader } from './OfferingHeader';

interface OfferingDetailsProps {
  offering: Offering;
  tabs: OfferingTab[];
}

export const OfferingDetails: React.SFC<OfferingDetailsProps> = props => (
  <div className="wrapper wrapper-content">
    {props.offering.shared && (
      <div className="pull-right m-r-md">
        <OfferingActions row={props.offering}/>
      </div>
    )}
    <OfferingHeader offering={props.offering}/>
    <Row>
      <Col lg={12}>
        <OfferingTabsComponent tabs={props.tabs}/>
      </Col>
    </Row>
  </div>
);
