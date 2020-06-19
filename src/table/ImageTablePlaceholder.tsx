import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import './ImageTablePlaceholder.scss';

export interface ImageTablePlaceholderProps {
  illustration: string;
  title: React.ReactNode;
  description: React.ReactNode;
  action?: React.ReactNode;
}

export const ImageTablePlaceholder: React.FC<ImageTablePlaceholderProps> = props => (
  <Row className="ImageTablePlaceholder">
    <Col sm={6} smOffset={3}>
      <Row>
        <Col className="ImageTablePlaceholder__img" sm={8} smOffset={2}>
          <img src={props.illustration} />
        </Col>
      </Row>
      <Row>
        <Col className="ImageTablePlaceholder__body">
          <div className="text-center">
            <h2>{props.title}</h2>
            <p>{props.description}</p>
            {props.action}
          </div>
        </Col>
      </Row>
    </Col>
  </Row>
);
