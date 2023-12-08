import { Accordion, Col, Row } from 'react-bootstrap';

import { getFormLimitParser } from '@waldur/marketplace/common/registry';
import { PlanSection } from '@waldur/marketplace/details/plan/PlanSection';
import { OrderDetailsProps } from '@waldur/marketplace/types';

import { DetailsSection } from './DetailsSection';
import { LimitsSection } from './LimitsSection';
import { OrderDetailsSummary } from './OrderDetailsSummary';
import { SummarySection } from './SummarySection';

export const OrderAccordion = (
  props: OrderDetailsProps & { loadData(): void },
) => {
  const limitParser = getFormLimitParser(props.order.offering_type);
  const limits = limitParser(props.order.limits);

  return (
    <Row>
      <Col md={9}>
        <Accordion id="order-details" defaultActiveKey="summary">
          <SummarySection
            order={props.order}
            offering={props.offering}
            loadData={props.loadData}
          />
          <PlanSection order={props.order} offering={props.offering} />
          <LimitsSection
            components={props.offering.components}
            limits={limits}
          />
          <DetailsSection order={props.order} offering={props.offering} />
        </Accordion>
      </Col>
      <Col md={3}>
        <OrderDetailsSummary offering={props.offering} />
      </Col>
    </Row>
  );
};
