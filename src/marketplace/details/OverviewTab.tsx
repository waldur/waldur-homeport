import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';

import { LeafletMap } from './LeafletMap';

const DemoButton = () => (
  <button className="btn btn-outline btn-success btn-sm">
    <i className="fa fa-comment"/>
    {' '}
    {translate('Request demo')}
  </button>
);

interface OverviewTabProps {
  offering: Offering;
}

export const OverviewTab = (props: OverviewTabProps) => (
  <Row>
    <Col md={6}>
      <h4>{translate('Offering details')}</h4>
      <div dangerouslySetInnerHTML={{__html: props.offering.full_description}}/>
    </Col>
    <Col md={6}>
      {props.offering.vendor_details && (
        <>
          <div className="display-flex justify-content-between align-items-baseline m-b-sm">
            <h4>{translate('Vendor details')}</h4>
            <DemoButton/>
          </div>
          <div dangerouslySetInnerHTML={{__html: props.offering.vendor_details}}/>
        </>
      )}

      {props.offering.geolocations && props.offering.geolocations.length > 0 && (
        <>
          <h4 className="header-bottom-border">
            {translate('Provider location')}
          </h4>
          <LeafletMap positions={props.offering.geolocations}/>
        </>
      )}
    </Col>
  </Row>
);
