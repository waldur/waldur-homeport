import { Col, Row } from 'react-bootstrap';

import { OrderDetailsProps } from '@waldur/marketplace/types';

import { OrderDetailsSummary } from './OrderDetailsSummary';

export const OrderAccordion = (
  props: OrderDetailsProps & { loadData(): void },
) => {
  return (
    <Row>
      <Col md={9} />
      <Col md={3}>
        <OrderDetailsSummary offering={props.offering} />
      </Col>
    </Row>
  );
};
