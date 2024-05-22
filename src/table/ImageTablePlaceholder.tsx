import React from 'react';
import { Col, Row } from 'react-bootstrap';

interface ImageTablePlaceholderProps {
  illustration: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export const ImageTablePlaceholder: React.FC<ImageTablePlaceholderProps> = (
  props,
) => (
  <Row className="justify-content-center" style={{ clear: 'both' }}>
    <Col sm={4}>
      <div style={{ width: '100%' }}>{props.illustration}</div>
      <div className="text-center">
        <h2>{props.title}</h2>
        {props.description && <p>{props.description}</p>}
        {props.action}
      </div>
    </Col>
  </Row>
);
