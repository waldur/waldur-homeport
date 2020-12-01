import React from 'react';
import { Row } from 'react-bootstrap';

export const GroupHeader = ({ title }) => (
  <Row style={{ textAlign: 'center', textTransform: 'uppercase', margin: 17 }}>
    {title}
  </Row>
);
