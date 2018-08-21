import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { translate } from '@waldur/i18n';

import { LeafletMap } from './LeafletMap';

const DemoButton = () => (
  <button className="btn btn-outline btn-success btn-sm">
    <i className="fa fa-comment"/>
    {' '}
    {translate('Request demo')}
  </button>
);

export const OverviewTab = props => (
  <Row>
    {props.product.full_description && (
      <Col md={6}>
        <h4>{translate('Product details')}</h4>
        <div dangerouslySetInnerHTML={{__html: props.product.full_description}}/>
      </Col>
    )}
    {props.product.vendor_details && (
      <Col md={6}>
        <div className="display-flex justify-content-between align-items-baseline m-b-sm">
          <h4>{translate('Vendor details')}</h4>
          <DemoButton/>
        </div>
        <div dangerouslySetInnerHTML={{__html: props.product.vendor_details}}/>

        <h4 className="header-bottom-border">
          {translate('Provider location')}
        </h4>
        <LeafletMap positions={props.product.geolocations}/>
      </Col>
    )}
  </Row>
);
