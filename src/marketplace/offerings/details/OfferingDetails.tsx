import React from 'react';
import { Button, Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import {
  OfferingTabsComponent,
  OfferingTab,
} from '@waldur/marketplace/details/OfferingTabsComponent';
import { Offering } from '@waldur/marketplace/types';

import { OfferingItemActions } from '../actions/OfferingItemActions';

import { OfferingHeader } from './OfferingHeader';

interface OfferingDetailsProps {
  offering: Offering;
  tabs: OfferingTab[];
  reInitResource(): void;
}

export const OfferingDetails: React.FC<OfferingDetailsProps> = (props) => (
  <>
    {props.offering.shared && (
      <div className="pull-right me-3">
        <Button size="sm" onClick={props.reInitResource}>
          <i className="fa fa-refresh" /> {translate('Refresh')}
        </Button>
        <OfferingItemActions offering={props.offering} />
      </div>
    )}
    <OfferingHeader offering={props.offering} />
    <Row>
      <Col lg={12} style={{ overflow: 'auto' }}>
        <OfferingTabsComponent tabs={props.tabs} />
      </Col>
    </Row>
  </>
);
