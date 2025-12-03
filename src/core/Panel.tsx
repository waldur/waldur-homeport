import classNames from 'classnames';
import React, { PropsWithChildren } from 'react';
import { Card } from 'react-bootstrap';

interface PanelProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  id?: string;
  actions?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  cardBordered?: boolean;
}

export const Panel: React.FC<PropsWithChildren<PanelProps>> = ({
  title,
  subtitle,
  id,
  children,
  className,
  bodyClassName,
  titleClassName,
  subtitleClassName,
  cardBordered,
  actions,
}) => (
  <Card
    className={classNames(cardBordered && 'card-bordered', className)}
    id={id}
  >
    {title && (
      <Card.Header>
        <div className="d-flex flex-column">
          <Card.Title className="mb-0">
            <h3 className={titleClassName}>{title}</h3>
          </Card.Title>
          {subtitle && (
            <Card.Subtitle
              className={classNames('text-muted mt-1', subtitleClassName)}
            >
              <p className="fs-6 mb-0">{subtitle}</p>
            </Card.Subtitle>
          )}
        </div>
        <div className="card-toolbar">{actions}</div>
      </Card.Header>
    )}
    <Card.Body className={bodyClassName}>{children}</Card.Body>
  </Card>
);
