import { FunctionComponent } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { ProviderOfferingDetails as Offering } from 'waldur-js-client';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { LeafletMap } from '@/map/LeafletMap';
import { isExperimentalUiComponentsVisible } from '@/marketplace/utils';

import { PublicOfferingCardTitle } from './PublicOfferingCardTitle';

interface OwnProps {
  offering: Offering;
}

export const PublicOfferingLocation: FunctionComponent<OwnProps> = ({
  offering,
}) => {
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

  return (
    <Card className="card-bordered mb-10">
      <Card.Body>
        <PublicOfferingCardTitle>
          {translate('Location')}
        </PublicOfferingCardTitle>
        <Row>
          <Col xs={12} lg className="mb-5 mb-lg-0">
            <div className="bg-gray-300 dark:bg-gray-dark-600 w-full h-full min-h-[300px]">
              {offering.latitude && offering.longitude ? (
                <LeafletMap
                  latitude={offering.latitude}
                  longitude={offering.longitude}
                />
              ) : (
                <div className="flex items-center justify-center h-full display-5 text-quaternary">
                  {translate('No location available')}
                </div>
              )}
            </div>
          </Col>
          {showExperimentalUiComponents && (
            <Col xs={12} lg={4}>
              <div className="bg-tertiary p-10 h-full">
                <PublicOfferingCardTitle>
                  {translate('Availability:')}
                </PublicOfferingCardTitle>
                <ul>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <li className="mb-2" key={i}>
                      <Link
                        state=""
                        className="text-decoration-underline text-brand"
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
