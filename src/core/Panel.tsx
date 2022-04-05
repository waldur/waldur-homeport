import React from 'react';
import { Card } from 'react-bootstrap';

interface PanelProps {
  title?: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  children,
  className,
  actions,
}) => (
  <Card className={className}>
    {title && (
      <Card.Header>
        <Card.Title>
          <h3>{title}</h3>
        </Card.Title>
        <div className="card-toolbar">{actions}</div>
      </Card.Header>
    )}
    <Card.Body>{children}</Card.Body>
  </Card>
);
