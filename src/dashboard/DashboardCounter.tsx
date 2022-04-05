import React, { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

interface DashboardCounterProps {
  value: React.ReactNode;
  label: React.ReactNode;
}

export const DashboardCounter: FunctionComponent<DashboardCounterProps> = (
  props,
) =>
  props.value !== undefined ? (
    <Card>
      <Card.Header>
        <Card.Title>
          <h3>{props.label}</h3>
        </Card.Title>
        <div className="card-toolbar">
          <h3>{props.value}</h3>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="mb-5">{props.children}</div>
      </Card.Body>
    </Card>
  ) : null;
