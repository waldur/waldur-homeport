import { WarningCircleIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, ReactNode } from 'react';
import { Card } from 'react-bootstrap';

import { FeaturedIcon } from 'waldur-ui';

interface WarnCardProps {
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
  prominent?: boolean;
}

export const WarnCard: FC<WarnCardProps> = ({
  title,
  description,
  className,
  prominent,
}) => (
  <Card
    role="alert"
    className={classNames(
      'card-bordered rounded-3',
      prominent && 'bg-light-warning border-start border-2 border-warning',
      className,
    )}
  >
    <Card.Body className="d-flex align-items-start gap-3 p-4">
      <FeaturedIcon
        icon={<WarningCircleIcon weight="bold" />}
        variant="warning"
      />

      <div className={prominent ? 'text-dark' : undefined}>
        <div className="mb-1 fw-bold">{title}</div>
        <div className={prominent ? undefined : 'text-muted'}>
          {description}
        </div>
      </div>
    </Card.Body>
  </Card>
);
