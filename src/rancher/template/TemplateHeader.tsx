import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { FormattedMarkdown } from '@waldur/core/FormattedMarkdown';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';

export const TemplateHeader: FunctionComponent<any> = (props) => (
  <Row>
    <Col md={3}>
      <OfferingLogo src={props.template.icon} />
    </Col>
    <Col md={9}>
      <FormattedMarkdown text={props.version.app_readme} />
    </Col>
  </Row>
);
