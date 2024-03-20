import { FunctionComponent } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { CallOffering } from '@waldur/proposals/types';
import { Field } from '@waldur/resource/summary';

interface OwnProps {
  row: CallOffering;
}

export const OfferingRequestsListExpandableRow: FunctionComponent<OwnProps> = ({
  row,
}) => (
  <div className="container-fluid m-t">
    <Container>
      <Row className="mb-6">
        <Col sm={6}>
          <Field
            label={translate('Contact')}
            value={`${row.created_by_name} / ${row.created_by_email}`}
          />
        </Col>
        <Col sm={6}>
          {typeof row.attributes?.limits === 'object' &&
            Object.entries(row.attributes.limits).map(([key, value]) => (
              <Field key={key} label={key} value={value} />
            ))}
        </Col>
      </Row>
      <Field label={translate('Message')} value={row.description} isStuck />
    </Container>
  </div>
);
