import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { FormattedMarkdown } from '@waldur/core/FormattedMarkdown';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';

export const TemplateHeader = props => (
  <Row>
    <Col md={3}>
      <OfferingLogo src={props.template.icon} />
    </Col>
    <Col md={9}>
      <FormattedMarkdown text={props.version.app_readme} />
    </Col>
  </Row>
);
