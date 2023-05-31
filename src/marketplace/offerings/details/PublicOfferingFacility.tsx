import { FunctionComponent } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { LeafletMap } from '@waldur/map/LeafletMap';
import { Offering } from '@waldur/marketplace/types';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

import { PublicOfferingCardTitle } from './PublicOfferingCardTitle';

interface OwnProps {
  offering: Offering;
}

export const PublicOfferingFacility: FunctionComponent<OwnProps> = ({
  offering,
}) => {
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

  return (
    <Card className="mb-10">
      <Card.Body>
        <PublicOfferingCardTitle>
          {translate('Facility')}
        </PublicOfferingCardTitle>
        <Row>
          <Col xs={12} lg className="mb-5 mb-lg-0">
            <div className="map bg-gray-300 w-100 h-100 min-h-300px">
              {offering.latitude && offering.longitude ? (
                <LeafletMap
                  latitude={offering.latitude}
                  longitude={offering.longitude}
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100 display-5 text-muted">
                  {translate('No location available')}
                </div>
              )}
            </div>
          </Col>
          {showExperimentalUiComponents && (
            <Col xs={12} lg={4}>
              <div className="bg-gray-100 p-10 h-100">
                <PublicOfferingCardTitle>
                  {translate('Availability:')}
                </PublicOfferingCardTitle>
                <ul>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <li className="mb-2" key={i}>
                      <Link
                        state=""
                        className="text-decoration-underline text-dark text-hover-primary"
                      >
                        link {i}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>
          )}
        </Row>
      </Card.Body>
    </Card>
  );
};
