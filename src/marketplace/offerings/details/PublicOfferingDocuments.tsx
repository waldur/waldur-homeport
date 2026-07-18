import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Offering } from 'waldur-js-client';

import { PublicOfferingDocumentsTable } from './PublicOfferingDocumentsTable';

interface PublicOfferingDocumentsProps {
  offering: Offering;
}

export const PublicOfferingDocuments: FunctionComponent<
  PublicOfferingDocumentsProps
> = ({ offering }) => {
  return (
    <Row className="mb-10" id="documents">
      <Col sm={12} md>
        <PublicOfferingDocumentsTable offering={offering} />
      </Col>
    </Row>
  );
};
