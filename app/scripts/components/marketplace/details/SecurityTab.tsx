import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { translate } from '@waldur/i18n';
import { Product } from '@waldur/marketplace/types';

import { FeaturesTab } from './FeaturesTab';
import { LeafletMap } from './LeafletMap';

interface SecurityTabProps {
  product: Product;
  sections: any[];
}

export const SecurityTab = (props: SecurityTabProps) => (
  <Row>
    {props.product.geolocations && props.product.geolocations.length > 0 && (
      <Col md={4}>
        <h4 className="header-bottom-border">
          {translate('Provider location')}
        </h4>
        <LeafletMap positions={props.product.geolocations}/>
      </Col>
    )}
    <Col md={8}>
      <h4 className="header-bottom-border">
        {translate('Security features')}
      </h4>
      <FeaturesTab product={props.product} sections={props.sections}/>
    </Col>
  </Row>
);
