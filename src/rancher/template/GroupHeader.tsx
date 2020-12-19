import { FunctionComponent } from 'react';
import { Row } from 'react-bootstrap';

export const GroupHeader: FunctionComponent<{ title }> = ({ title }) => (
  <Row style={{ textAlign: 'center', textTransform: 'uppercase', margin: 17 }}>
    {title}
  </Row>
);
