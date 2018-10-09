import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { Screenshot } from '@waldur/marketplace/types';

interface ScreenshotsTabProps {
  screenshots: Screenshot[];
}

export const ScreenshotsTab = (props: ScreenshotsTabProps) => (
  <Row>
    {props.screenshots.map((item, index) => (
      <Col key={index} md={4} className="text-center">
        <img src={item.thumbnail} className="img-thumbnail m-xs"/>
        <h4 className="m-t-md">{item.name}</h4>
        <p>{item.description}</p>
      </Col>
    ))}
  </Row>
);
