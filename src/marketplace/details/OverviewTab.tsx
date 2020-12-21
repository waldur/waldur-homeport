import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { translate } from '@waldur/i18n';
import { LeafletMap } from '@waldur/map/LeafletMap';
import { Offering } from '@waldur/marketplace/types';

const DemoButton: FunctionComponent = () => (
  <button className="btn btn-outline btn-success btn-sm">
    <i className="fa fa-comment" /> {translate('Request demo')}
  </button>
);

interface OverviewTabProps {
  offering: Offering;
}

export const OverviewTab: FunctionComponent<OverviewTabProps> = (props) => {
  const hasLocation = props.offering.latitude && props.offering.longitude;
  const description = (
    <>
      <h4>{translate('Offering details')}</h4>
      <FormattedHtml html={props.offering.full_description} />
    </>
  );

  if (!hasLocation) {
    return (
      <Row>
        <Col md={12}>{description}</Col>
      </Row>
    );
  }
  return (
    <Row>
      <Col md={6}>{description}</Col>
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

        <h4 className="header-bottom-border">
          {translate('Provider location')}
        </h4>
        <LeafletMap
          latitude={props.offering.latitude}
          longitude={props.offering.longitude}
        />
      </Col>
    </Row>
  );
};
