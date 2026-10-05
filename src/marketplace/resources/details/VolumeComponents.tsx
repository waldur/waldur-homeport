import { Col, Row } from 'react-bootstrap';

import { QuotaCell } from './QuotaCell';
import { getStorageTitle } from './storageTitle';

export const VolumeComponents = ({ resource }) => {
  return (
    <Row>
      <Col xs={12}>
        <QuotaCell
          title={getStorageTitle(resource.type_name)}
          usage={(resource.size / 1024).toFixed()}
          units="GB"
        />
      </Col>
    </Row>
  );
};
