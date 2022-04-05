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
      <Col sm={3} className="mt-2">
        {translate('Description')}:
      </Col>
      <Col sm={9} className="mt-2">
        {props.description || 'N/A'}
      </Col>
    </Row>

    {props.end_date ? (
      <Row>
        <Col sm={3} className="mt-2">
          {translate('End date')}:
        </Col>
        <Col sm={9} className="mt-2">
          {formatDate(props.end_date)}
        </Col>
      </Row>
    ) : null}
  </Container>
);
