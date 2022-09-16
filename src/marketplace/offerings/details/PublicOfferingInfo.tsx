import { FunctionComponent } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { translate } from '@waldur/i18n';
import { PublicOfferingAttributes } from '@waldur/marketplace/offerings/details/PublicOfferingAttributes';
import { Category, Offering } from '@waldur/marketplace/types';

import { PublicOfferingCardTitle } from './PublicOfferingCardTitle';
import './PublicOfferingInfo.scss';

interface PublicOfferingInfoProps {
  offering: Offering;
  category: Category;
}

export const PublicOfferingInfo: FunctionComponent<PublicOfferingInfoProps> = ({
  offering,
  category,
}) => (
  <Row className="mb-10" id="description">
    <Col sm={12} md={8}>
      <Card>
        <Card.Body>
          <PublicOfferingCardTitle>
            {translate('Description')}
          </PublicOfferingCardTitle>
          <FormattedHtml html={offering.full_description} />
        </Card.Body>
      </Card>
    </Col>
    <Col sm={12} md={4}>
      <Card>
        <Card.Body>
          <PublicOfferingCardTitle>
            {translate('Attributes')}
          </PublicOfferingCardTitle>
          <PublicOfferingAttributes offering={offering} category={category} />
        </Card.Body>
      </Card>
    </Col>
  </Row>
);
