import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { SafeMarkdown } from '@/core/SafeMarkdown';
import { OfferingLogo } from '@/marketplace/common/OfferingLogo';

export const TemplateHeader: FunctionComponent<any> = (props) => (
  <Row>
    <Col md={3}>
      <OfferingLogo src={props.template.icon} />
    </Col>
    <Col md={9}>
      <SafeMarkdown text={props.version.app_readme} />
    </Col>
  </Row>
);
