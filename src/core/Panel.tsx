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
        <h5>{title}</h5>
        {actions}
      </Card.Header>
    )}
    <Card.Body>{children}</Card.Body>
  </Card>
);
