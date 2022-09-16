import { FunctionComponent } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

import { PublicOfferingCardTitle } from './PublicOfferingCardTitle';
import { PublicOfferingComponentsTable } from './PublicOfferingComponentsTable';

interface PublicOfferingComponentsProps {
  offering: Offering;
}

export const PublicOfferingComponents: FunctionComponent<PublicOfferingComponentsProps> =
  ({ offering }) => {
    const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

    return (
      <Row className="mb-10" id="components">
        <Col sm={12} md>
          <Card>
            <Card.Body>
              <PublicOfferingCardTitle>
                {translate('Components')}
              </PublicOfferingCardTitle>
              <PublicOfferingComponentsTable offering={offering} />
            </Card.Body>
          </Card>
        </Col>
        {showExperimentalUiComponents && (
          <Col sm={12} md={4}>
            <Card>
              <Card.Body>
                <PublicOfferingCardTitle>
                  {translate('Docs & resources')}
                </PublicOfferingCardTitle>
                <div className="mb-2">
                  <a className="text-decoration-underline text-dark text-hover-primary fs-7 mb-2">
                    Link 1
                  </a>
                </div>
                <div className="mb-2">
                  <a className="text-decoration-underline text-dark text-hover-primary fs-7 mb-2">
                    Link 2
                  </a>
                </div>
                <div className="mb-2">
                  <a className="text-decoration-underline text-dark text-hover-primary fs-7 mb-2">
                    Link 3
                  </a>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    );
  };
