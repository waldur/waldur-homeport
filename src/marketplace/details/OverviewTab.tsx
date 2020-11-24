import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { translate } from '@waldur/i18n';
import { LeafletMap } from '@waldur/map/LeafletMap';
import { Offering } from '@waldur/marketplace/types';

const DemoButton = () => (
  <button className="btn btn-outline btn-success btn-sm">
    <i className="fa fa-comment" /> {translate('Request demo')}
  </button>
);

interface OverviewTabProps {
  offering: Offering;
}

export const OverviewTab = (props: OverviewTabProps) => (
  <Row>
    <Col md={6}>
      <h4>{translate('Offering details')}</h4>
      <FormattedHtml html={props.offering.full_description} />
    </Col>
    <Col md={6}>
      {props.offering.vendor_details && (
        <>
          <div className="display-flex justify-content-between align-items-baseline m-b-sm">
            <h4>{translate('Service provider details')}</h4>
            <DemoButton />
          </div>
          <FormattedHtml html={props.offering.vendor_details} />
        </>
      )}

      {props.offering.latitude && props.offering.longitude ? (
        <>
          <h4 className="header-bottom-border">
            {translate('Provider location')}
          </h4>
          <LeafletMap
            latitude={props.offering.latitude}
            longitude={props.offering.longitude}
          />
        </>
      ) : null}
    </Col>
  </Row>
);
