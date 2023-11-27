import { Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { QuotaCell } from './QuotaCell';

export const VolumeComponents = ({ resource }) => {
  return (
    <Row>
      <Col xs={12}>
        <QuotaCell
          title={translate('{type} storage', { type: resource.type_name })}
          usage={(resource.size / 1024).toFixed()}
          units="GB"
        />
      </Col>
    </Row>
  );
};
