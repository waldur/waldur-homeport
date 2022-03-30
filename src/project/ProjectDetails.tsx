import { formatDate } from '@fullcalendar/core';
import { FunctionComponent } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

interface ProjectDetailsProps {
  name: string;
  description: string;
  end_date?: string;
}

export const ProjectDetails: FunctionComponent<ProjectDetailsProps> = (
  props,
) => (
  <Container>
    <Row>
      <Col sm={3}>{translate('Name')}:</Col>
      <Col sm={9}>{props.name}</Col>
    </Row>

    <Row>
      <Col sm={3} className="m-t-sm">
        {translate('Description')}:
      </Col>
      <Col sm={9} className="m-t-sm">
        {props.description || 'N/A'}
      </Col>
    </Row>

    {props.end_date ? (
      <Row>
        <Col sm={3} className="m-t-sm">
          {translate('End date')}:
        </Col>
        <Col sm={9} className="m-t-sm">
          {formatDate(props.end_date)}
        </Col>
      </Row>
    ) : null}
  </Container>
);
