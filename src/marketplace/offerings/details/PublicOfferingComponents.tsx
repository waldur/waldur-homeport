import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { Offering } from '@/marketplace/types';

import { PublicOfferingComponentsTable } from './PublicOfferingComponentsTable';

interface PublicOfferingComponentsProps {
  offering: Offering;
}

export const PublicOfferingComponents: FunctionComponent<
  PublicOfferingComponentsProps
> = ({ offering }) => {
  return (
    <Row className="mb-10" id="components">
      <Col sm={12} md>
        <PublicOfferingComponentsTable offering={offering} />
      </Col>
    </Row>
  );
};
