import React from 'react';
import { Col, Row } from 'react-bootstrap';

export interface ImageTablePlaceholderProps {
  illustration: string;
  title: React.ReactNode;
  description: React.ReactNode;
  action?: React.ReactNode;
}

export const ImageTablePlaceholder: React.FC<ImageTablePlaceholderProps> = (
  props,
) => (
  <Row className="justify-content-center" style={{ clear: 'both' }}>
    <Col sm={4}>
      <img src={props.illustration} style={{ width: '100%' }} />
      <div className="text-center">
        <h2>{props.title}</h2>
        <p>{props.description}</p>
        {props.action}
      </div>
    </Col>
  </Row>
);
