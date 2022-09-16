import { FunctionComponent, useContext } from 'react';
import {
  Accordion,
  AccordionContext,
  Button,
  Card,
  Col,
  Row,
  useAccordionButton,
} from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { PublicOfferingCardTitle } from './PublicOfferingCardTitle';

function CustomToggle({ children, eventKey }) {
  const { activeEventKey } = useContext(AccordionContext);
  const decoratedOnClick = useAccordionButton(eventKey);
  const isCurrentEventKey = activeEventKey === eventKey;

  return (
    <Button
      type="button"
      variant=""
      className="border-bottom border-dark w-100 rounded-0 d-flex justify-content-between align-items-center text-start"
      onClick={decoratedOnClick}
    >
      {children}
      <i
        className={`fa fa-${
          isCurrentEventKey ? 'minus' : 'plus'
        } fs-4 ms-2 text-dark`}
      ></i>
    </Button>
  );
}

export const PublicOfferingFAQ: FunctionComponent = () => (
  <Card className="mb-10" id="faq">
    <Card.Body>
      <PublicOfferingCardTitle>{translate('FAQ')}</PublicOfferingCardTitle>
      <Row>
        <Col md={12} lg={7} xl={{ span: 6, offset: 2 }} className="mb-sm-5">
          <Accordion defaultActiveKey="0">
            {['0', '1', '2', '3'].map((i) => (
              <div key={i}>
                <CustomToggle eventKey={i}>
                  Does this offering have outside connectivity?
                </CustomToggle>
                <Accordion.Collapse eventKey={i}>
                  <Card.Body>Hello! I am the body</Card.Body>
                </Accordion.Collapse>
              </div>
            ))}
          </Accordion>
        </Col>
        <Col md={12} lg={5} xl={4} className="text-center">
          <h4 className="mb-10">{translate('Still unsure? Ask a question')}</h4>
          <Button variant="dark">{translate('Ask a question')}</Button>
        </Col>
      </Row>
    </Card.Body>
  </Card>
);
